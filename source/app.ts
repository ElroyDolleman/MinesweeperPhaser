const CELL_SIZE: number = 44;

class GameScene extends Phaser.Scene
{
    board: Board;

    constructor()
    {
        super({ key: 'GameScene', active: true});
    }

    preload()
    {
        // Load the spritesheet that contains all images
        this.load.spritesheet('minesweeper_sheet', 'assets/minesweeper_sheet.png', { frameWidth: CELL_SIZE, frameHeight: CELL_SIZE });
    }

    create()
    {
        // Create the board/grid
        this.board = new Board(this, new Phaser.Geom.Point(0, 0), 10, 10);
        this.board.placeMines(30);

        // The input event for clicking on the screen
        this.input.on('pointerdown', function (pointer) 
        {
            // If the board is a state that disables input, end this function
            if (!this.board.inputEnabled)
            {
                return;
            }

            // Calculate the grid location that was clicked
            var gridPosClick = this.board.toGridPosition(pointer.x, pointer.y);

            // Check if the click happened in the grid
            if (this.board.containsTile(gridPosClick.x, gridPosClick.y))
            {
                // Reveal the tile that was clicked
                var revealedTile = this.board.revealTile(gridPosClick.x, gridPosClick.y);
            }
            
        }, this);
    }

    update(time, delta)
    {
        this.board.update(1000 / 60);
    }
}

var config = {
    type: Phaser.AUTO,
    width: 480,
    height: 800,
    backgroundColor: '#ffffff',
    parent: 'minesweeper',
    scene: [ GameScene ]
};

var game = new Phaser.Game(config);