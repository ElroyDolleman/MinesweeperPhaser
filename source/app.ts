const CELL_SIZE: number = 52;
const SCREEN_WIDTH: number = 480;
const SCREEN_HEIGHT: number = 800;

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
        game.input.mouse.capture = true;

        // Create the board/grid
        this.board = new Board(this, 9, 9);
        this.board.setBoardPosition(SCREEN_WIDTH / 2 - this.board.boardWidth / 2, SCREEN_HEIGHT / 2 - this.board.boardHeight / 2);
        this.board.createBoard(this);
        this.board.placeMines(10);

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

            // If the right button is down, mark the tile instead of revealing it
            if (pointer.rightButtonDown())
            {
                // Mark the tile that the player clicks on (will automatically unmark if it's marked already)
                if (this.board.containsTile(gridPosClick.x, gridPosClick.y))
                {
                    this.board.markTile(gridPosClick.x, gridPosClick.y);
                }

                // Quit the function to prevent revealing the tile
                return;
            }
            // Check if the click happened in the grid
            if (this.board.containsTile(gridPosClick.x, gridPosClick.y))
            {
                // Reveal the tile that was clicked
                var revealedTile = this.board.revealTile(gridPosClick.x, gridPosClick.y);

                // When the revealed tile has a mine, it's game over
                if (!revealedTile.isMarked && revealedTile.containsMine)
                {
                    // Show the player where all the mines are
                    this.board.showAllMines();

                    // Tell the board that it's game over
                    this.board.changeState(BoardStates.GameOver);
                }
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
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#e9f4fc',
    parent: 'minesweeper',
    disableContextMenu: true,
    scene: [ GameScene ]
};

var game = new Phaser.Game(config);