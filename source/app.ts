const CELL_SIZE: number = 52;
const SCREEN_WIDTH: number = 480;
const SCREEN_HEIGHT: number = 800;
const TIMER_FONT_WIDTH: number = 50;
const TIMER_FONT_HEIGHT: number = 90;
const MAX_TIME: number = 999;

class GameScene extends Phaser.Scene
{
    board: Board;
    ui: UI;

    timer: number = 0;
    secondsPassed: number = 0;
    timerIsRunning: boolean = false;

    gameEnded: boolean = false;

    constructor()
    {
        super({ key: 'GameScene', active: true});
    }

    preload()
    {
        // Load the spritesheet that contains all images
        this.load.spritesheet('minesweeper_sheet', 'assets/minesweeper_sheet.png', { frameWidth: CELL_SIZE, frameHeight: CELL_SIZE });
        this.load.spritesheet('timer_font_sheet', 'assets/timer_font_sheet.png', { frameWidth: TIMER_FONT_WIDTH, frameHeight: TIMER_FONT_HEIGHT });
    }

    create()
    {
        game.input.mouse.capture = true;

        // Create the board/grid
        this.board = new Board(this, 9, 9);
        this.board.setBoardPosition(SCREEN_WIDTH / 2 - this.board.boardWidth / 2, SCREEN_HEIGHT / 2 - this.board.boardHeight / 2);
        this.board.createBoard(this);
        this.board.placeMines(10);

        // Make the UI as width as the board and place it above the board
        this.ui = new UI(this, this.board.boardPosition.x, this.board.boardPosition.x, this.board.boardWidth);
        this.ui.updateMinesAmount(this.board.minesAmount);

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

            // If the click was not on the board, cancle the function
            if (!this.board.containsTile(gridPosClick.x, gridPosClick.y))
            {
                return;
            }

            // Start the timer if it has not started yet
            if (!this.timerIsRunning) this.timerIsRunning = true;

            // If the right button is down, mark the tile instead of revealing it
            if (pointer.rightButtonDown())
            {
                // Mark the tile that the player clicks on (will automatically unmark if it's marked already)
                this.board.markTile(gridPosClick.x, gridPosClick.y);

                // Update the amount of mines depending how many tiles are marked
                this.ui.updateMinesAmount(this.board.minesAmount - this.board.markedAmount);
            }
            // If the left button is down, reveal the tile
            else
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

                    // Stop the timer
                    this.timerIsRunning = false;
                }
            }

        }, this);
    }

    update()
    {
        // Stop the update if the game ended
        if (this.gameEnded) return;

        // Fixed timestep
        var elapsedMiliseconds = 1000 / 60;

        // Update the board (for autorevealing)
        this.board.update(elapsedMiliseconds);

        if (this.board.allSafeTilesAreRevealed)
        {
            // The player has won the game so it ended
            this.gameEnded = true;

            // Show the player where all the mines are by marking them
            this.board.markAllMines();

            // Update the UI
            this.ui.updateMinesAmount(0);
        }
        else if (this.timerIsRunning && this.secondsPassed < MAX_TIME)
        {
            // When the next second has passed, update it in the UI
            this.timer += elapsedMiliseconds;
            if (this.timer > (this.secondsPassed + 1) * 1000)
            {
                this.ui.updateTime(this.secondsPassed++);
            }
        }
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