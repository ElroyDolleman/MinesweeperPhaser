const CELL_SIZE: number = 52;
const SCREEN_WIDTH: number = 480;
const SCREEN_HEIGHT: number = 800;
const TIMER_FONT_WIDTH: number = 50;
const TIMER_FONT_HEIGHT: number = 90;
const MAX_TIME: number = 999;

const MAX_BOARD_ROWS: number = 9;
const BOARD_WIDTH: number = (MAX_BOARD_ROWS * CELL_SIZE);
const BOARD_POSITION_X: number = SCREEN_WIDTH / 2 - BOARD_WIDTH / 2;

// The amount of time the touch needs to be held down to mark a tile instead of revealing it in miliseconds
const HOLD_TIME_TO_MARK: number = 300;

enum InputActions
{
    Reveal,
    Mark
}

class GameScene extends Phaser.Scene
{
    board: Board;
    uiManager: UIManager;

    timer: number = 0;
    secondsPassed: number = 0;
    timerIsRunning: boolean = false;

    touchDownTime: number = 0;
    disableHeldDown: boolean = false;

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
        this.load.image('ui', 'assets/ui_sheet.png');
    }

    reset()
    {
       this.timer = 0;
       this.secondsPassed = 0;
       this.timerIsRunning = false;
       this.gameEnded = false;

       this.uiManager.hud.updateTime(0);
       this.uiManager.hud.updateMinesAmount(this.board.minesAmount);
       this.uiManager.endScreen.hideEndScreen();

       this.board.reset();
    }

    create()
    {
        game.input.mouse.capture = true;

        window.addEventListener('resize', this.resize);
        this.resize();

        // Create the board/grid
        this.board = new Board(this, 9, 9);
        this.board.setBoardPosition(SCREEN_WIDTH / 2 - this.board.boardWidth / 2, SCREEN_HEIGHT / 2 - this.board.boardHeight / 2);
        this.board.createBoard(this);
        this.board.placeMines(10);

        // Initialize the UI Manager
        this.uiManager = new UIManager(this);
        this.uiManager.hud.updateMinesAmount(this.board.minesAmount);

        // Create a Restart Event
        let scene = this;
        this.uiManager.menu.addRestartEvent(function() {
            scene.reset();
        });
    }

    revealAction(tileLocationToReveal: Phaser.Geom.Point)
    {
        // Reveal the tile that was clicked
        var revealedTile = this.board.revealTile(tileLocationToReveal.x, tileLocationToReveal.y);

        // When the revealed tile has a mine, it's game over
        if (!revealedTile.isMarked && revealedTile.containsMine)
        {
            // Show the player where all the mines are
            this.board.showAllMines();

            // Make the board inactive
            this.board.changeState(BoardStates.Inactive);

            // Stop the timer
            this.timerIsRunning = false;

            // Show the game over end screen
            this.uiManager.endScreen.showEndScreen(false);
        }

        // Start the timer if it has not started yet
        else if (!this.timerIsRunning) this.timerIsRunning = true;
    }

    markAction(tileLocationToMark: Phaser.Geom.Point)
    {
        // Mark the tile that the player clicks on (will automatically unmark if it's marked already)
        this.board.markTile(tileLocationToMark.x, tileLocationToMark.y);

        // Update the amount of mines depending how many tiles are marked
        this.uiManager.hud.updateMinesAmount(this.board.minesAmount - this.board.markedAmount);

        // Start the timer if it has not started yet
        if (!this.timerIsRunning) this.timerIsRunning = true;
    }

    boardInputUpdate()
    {
        // If the board is not interactive, cancel the function to prevent unecessary input checks
        if (!this.board.isInteractive) return;

        if (this.input.activePointer.isDown && !this.disableHeldDown)
        {
            // Calculate the grid location that was clicked and select that tile
            var gridPosClick = this.board.toGridPosition(this.input.activePointer.x, this.input.activePointer.y);
            var newTileWasSelected = this.board.selectTile(gridPosClick.x, gridPosClick.y);

            if (this.input.activePointer.wasTouch)
            {
                // If there was no new tile selected, count how long the current tile was held down
                if (!newTileWasSelected)
                {
                    this.touchDownTime += 1000 / 60;
                    
                    if (this.touchDownTime >= HOLD_TIME_TO_MARK)
                    {
                        this.touchDownTime = 0;
                        this.board.unselectCurrentTile();

                        // Fire the reveal action
                        this.markAction(this.getGridPointerLocation(this.input.activePointer));

                        // Make sure that holding down longer won't fire any functions anymore
                        this.disableHeldDown = true;
                    }
                }
                // Reset the timer whenever a different tile is selected
                else this.touchDownTime = 0;
            }
        }
        else if (this.input.activePointer.justUp)
        {
            // Unselect the currently selected tile
            this.board.unselectCurrentTile();

            // Reset the amount of time a touch input was held down
            this.touchDownTime = 0;

            // If the held down was disabled, enable it and cancel the up input
            if (this.disableHeldDown)
            {
                this.disableHeldDown = false;
                return;
            }

            if (this.input.activePointer.rightButtonDown())
            {
                // Calculate the grid location that was clicked
                var gridPosClick = this.getGridPointerLocation(this.input.activePointer);

                // Select the tile to give the player feedback which tile it is going to reveal
                if (gridPosClick != null)
                {
                    this.markAction(gridPosClick);
                }

                // Cancel the function so that the reveal action won't fire
                return;
            }

            // Calculate the grid location that was clicked
            var gridPosClick = this.getGridPointerLocation(this.input.activePointer);

            // Select the tile to give the player feedback which tile it is going to reveal
            if (gridPosClick != null)
            {
                this.revealAction(gridPosClick);
            }
        }
    }

    getGridPointerLocation(pointer: Phaser.Input.Pointer)
    {
        // Calculate the grid location that was clicked
        var gridPosClick = this.board.toGridPosition(pointer.x, pointer.y);

        // Check if the click was on the board
        if (this.board.containsTile(gridPosClick.x, gridPosClick.y))
        {
            return gridPosClick;
        }
        return null;
    }

    update()
    {
        this.boardInputUpdate();

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

            // Update the HUD and show the win screen
            this.uiManager.hud.updateMinesAmount(0);
            this.uiManager.endScreen.showEndScreen(true);
        }
        else if (this.timerIsRunning && this.secondsPassed < MAX_TIME)
        {
            // When the next second has passed, update it in the HUD
            this.timer += elapsedMiliseconds;
            if (this.timer > (this.secondsPassed + 1) * 1000)
            {
                this.uiManager.hud.updateTime(this.secondsPassed++);
            }
        }
    }

    resize() 
    {
        var canvas = game.canvas, width = window.innerWidth, height = window.innerHeight;
        var wratio = width / height, ratio = canvas.width / canvas.height;
    
        if (wratio < ratio) {
            canvas.style.width = width + "px";
            canvas.style.height = (width / ratio) + "px";
        } else {
            canvas.style.width = (height * ratio) + "px";
            canvas.style.height = height + "px";
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