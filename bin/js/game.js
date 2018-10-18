var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CELL_SIZE = 52;
var SCREEN_WIDTH = 480;
var SCREEN_HEIGHT = 800;
var TIMER_FONT_WIDTH = 50;
var TIMER_FONT_HEIGHT = 90;
var MAX_TIME = 999;
var MAX_BOARD_ROWS = 9;
var BOARD_WIDTH = (MAX_BOARD_ROWS * CELL_SIZE);
var BOARD_POSITION_X = SCREEN_WIDTH / 2 - BOARD_WIDTH / 2;
// The amount of time the touch needs to be held down to mark a tile instead of revealing it in miliseconds
var HOLD_TIME_TO_MARK = 300;
var InputActions;
(function (InputActions) {
    InputActions[InputActions["Reveal"] = 0] = "Reveal";
    InputActions[InputActions["Mark"] = 1] = "Mark";
})(InputActions || (InputActions = {}));
var GameScene = /** @class */ (function (_super) {
    __extends(GameScene, _super);
    function GameScene() {
        var _this = _super.call(this, { key: 'GameScene', active: true }) || this;
        _this.timer = 0;
        _this.secondsPassed = 0;
        _this.timerIsRunning = false;
        _this.touchDownTime = 0;
        _this.disableHeldDown = false;
        _this.gameEnded = false;
        return _this;
    }
    GameScene.prototype.preload = function () {
        // Load the spritesheet that contains all images
        this.load.spritesheet('minesweeper_sheet', 'assets/minesweeper_sheet.png', { frameWidth: CELL_SIZE, frameHeight: CELL_SIZE });
        this.load.spritesheet('timer_font_sheet', 'assets/timer_font_sheet.png', { frameWidth: TIMER_FONT_WIDTH, frameHeight: TIMER_FONT_HEIGHT });
        this.load.image('ui', 'assets/ui_sheet.png');
    };
    GameScene.prototype.reset = function () {
        this.timer = 0;
        this.secondsPassed = 0;
        this.timerIsRunning = false;
        this.gameEnded = false;
        this.uiManager.hud.updateTime(0);
        this.uiManager.hud.updateMinesAmount(this.board.minesAmount);
        this.uiManager.endScreen.hideEndScreen();
        this.board.reset();
    };
    GameScene.prototype.create = function () {
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
        var scene = this;
        this.uiManager.menu.addRestartEvent(function () {
            scene.reset();
        });
    };
    GameScene.prototype.revealAction = function (tileLocationToReveal) {
        // Reveal the tile that was clicked
        var revealedTile = this.board.revealTile(tileLocationToReveal.x, tileLocationToReveal.y);
        // When the revealed tile has a mine, it's game over
        if (!revealedTile.isMarked && revealedTile.containsMine) {
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
        else if (!this.timerIsRunning)
            this.timerIsRunning = true;
    };
    GameScene.prototype.markAction = function (tileLocationToMark) {
        // Mark the tile that the player clicks on (will automatically unmark if it's marked already)
        this.board.markTile(tileLocationToMark.x, tileLocationToMark.y);
        // Update the amount of mines depending how many tiles are marked
        this.uiManager.hud.updateMinesAmount(this.board.minesAmount - this.board.markedAmount);
        // Start the timer if it has not started yet
        if (!this.timerIsRunning)
            this.timerIsRunning = true;
    };
    GameScene.prototype.boardInputUpdate = function () {
        // If the board is not interactive, cancel the function to prevent unecessary input checks
        if (!this.board.isInteractive)
            return;
        if (this.input.activePointer.isDown && !this.disableHeldDown) {
            // Calculate the grid location that was clicked and select that tile
            var gridPosClick = this.board.toGridPosition(this.input.activePointer.x, this.input.activePointer.y);
            var newTileWasSelected = this.board.selectTile(gridPosClick.x, gridPosClick.y);
            if (this.input.activePointer.wasTouch) {
                // If there was no new tile selected, count how long the current tile was held down
                if (!newTileWasSelected) {
                    this.touchDownTime += 1000 / 60;
                    if (this.touchDownTime >= HOLD_TIME_TO_MARK) {
                        this.touchDownTime = 0;
                        this.board.unselectCurrentTile();
                        // Fire the reveal action
                        this.markAction(this.getGridPointerLocation(this.input.activePointer));
                        // Make sure that holding down longer won't fire any functions anymore
                        this.disableHeldDown = true;
                    }
                }
                // Reset the timer whenever a different tile is selected
                else
                    this.touchDownTime = 0;
            }
        }
        else if (this.input.activePointer.justUp) {
            // Unselect the currently selected tile
            this.board.unselectCurrentTile();
            // Reset the amount of time a touch input was held down
            this.touchDownTime = 0;
            // If the held down was disabled, enable it and cancel the up input
            if (this.disableHeldDown) {
                this.disableHeldDown = false;
                return;
            }
            if (this.input.activePointer.rightButtonDown()) {
                // Calculate the grid location that was clicked
                var gridPosClick = this.getGridPointerLocation(this.input.activePointer);
                // Select the tile to give the player feedback which tile it is going to reveal
                if (gridPosClick != null) {
                    this.markAction(gridPosClick);
                }
                // Cancel the function so that the reveal action won't fire
                return;
            }
            // Calculate the grid location that was clicked
            var gridPosClick = this.getGridPointerLocation(this.input.activePointer);
            // Select the tile to give the player feedback which tile it is going to reveal
            if (gridPosClick != null) {
                this.revealAction(gridPosClick);
            }
        }
    };
    GameScene.prototype.getGridPointerLocation = function (pointer) {
        // Calculate the grid location that was clicked
        var gridPosClick = this.board.toGridPosition(pointer.x, pointer.y);
        // Check if the click was on the board
        if (this.board.containsTile(gridPosClick.x, gridPosClick.y)) {
            return gridPosClick;
        }
        return null;
    };
    GameScene.prototype.update = function () {
        this.boardInputUpdate();
        // Stop the update if the game ended
        if (this.gameEnded)
            return;
        // Fixed timestep
        var elapsedMiliseconds = 1000 / 60;
        // Update the board (for autorevealing)
        this.board.update(elapsedMiliseconds);
        if (this.board.allSafeTilesAreRevealed) {
            // The player has won the game so it ended
            this.gameEnded = true;
            // Show the player where all the mines are by marking them
            this.board.markAllMines();
            // Update the HUD and show the win screen
            this.uiManager.hud.updateMinesAmount(0);
            this.uiManager.endScreen.showEndScreen(true);
        }
        else if (this.timerIsRunning && this.secondsPassed < MAX_TIME) {
            // When the next second has passed, update it in the HUD
            this.timer += elapsedMiliseconds;
            if (this.timer > (this.secondsPassed + 1) * 1000) {
                this.uiManager.hud.updateTime(this.secondsPassed++);
            }
        }
    };
    GameScene.prototype.resize = function () {
        var canvas = game.canvas, width = window.innerWidth, height = window.innerHeight;
        var wratio = width / height, ratio = canvas.width / canvas.height;
        if (wratio < ratio) {
            canvas.style.width = width + "px";
            canvas.style.height = (width / ratio) + "px";
        }
        else {
            canvas.style.width = (height * ratio) + "px";
            canvas.style.height = height + "px";
        }
    };
    return GameScene;
}(Phaser.Scene));
var config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#e9f4fc',
    parent: 'minesweeper',
    disableContextMenu: true,
    scene: [GameScene]
};
var game = new Phaser.Game(config);
var BoardStates;
(function (BoardStates) {
    BoardStates[BoardStates["Active"] = 0] = "Active";
    BoardStates[BoardStates["AutoRevealing"] = 1] = "AutoRevealing";
    BoardStates[BoardStates["Inactive"] = 2] = "Inactive";
})(BoardStates || (BoardStates = {}));
var Board = /** @class */ (function () {
    function Board(scene, gridWidth, gridHeight) {
        this.state = BoardStates.Active;
        this.autoRevealingInterval = 132; // Miliseconds
        this.autoRevealingTimer = 0;
        this.tilesRevealed = 0; // The amount of tiles that are revealed
        this.markedAmount = 0; // The amount of tiles that are marked
        this.gridSize = new Phaser.Geom.Point(gridWidth, gridHeight);
    }
    Object.defineProperty(Board.prototype, "totalTiles", {
        // The total amount of tiles
        get: function () { return this.gridSize.x * this.gridSize.y; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Board.prototype, "isInteractive", {
        // Whether input can make changes to the board or not
        get: function () { return this.state == BoardStates.Active; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Board.prototype, "boardWidth", {
        // The width and height of the board in pixels
        get: function () { return this.gridSize.x * CELL_SIZE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Board.prototype, "boardHeight", {
        get: function () { return this.gridSize.y * CELL_SIZE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Board.prototype, "unrevealedTiles", {
        // The amount of tiles that are still unrevealed
        get: function () { return this.totalTiles - this.tilesRevealed; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Board.prototype, "allSafeTilesAreRevealed", {
        // Whether all the tiles that are not mines are revealed
        get: function () { return this.unrevealedTiles == this.minesAmount; },
        enumerable: true,
        configurable: true
    });
    Board.prototype.setBoardPosition = function (x, y) {
        this.boardPosition = new Phaser.Geom.Point(x, y);
    };
    Board.prototype.createBoard = function (scene) {
        this.tiles = [];
        for (var y = 0; y < this.gridSize.y; y++) {
            // Add a new row
            this.tiles.push([]);
            for (var x = 0; x < this.gridSize.x; x++) {
                // Add a new tile on each grid cell
                this.tiles[y].push(new Tile(scene, this.toScreenPosition(x, y), x, y));
            }
        }
    };
    Board.prototype.reset = function () {
        for (var y = 0; y < this.gridSize.y; y++) {
            for (var x = 0; x < this.gridSize.x; x++) {
                this.tiles[y][x].reset();
            }
        }
        this.markedAmount = 0;
        this.tilesRevealed = 0;
        this.placeMines(this.minesAmount);
        this.changeState(BoardStates.Active);
    };
    Board.prototype.placeMines = function (amount) {
        var mines = 0;
        while (mines < amount) {
            // Randomly select a tile
            var tile = this.getTile(Phaser.Math.RND.integerInRange(0, this.gridSize.x - 1), Phaser.Math.RND.integerInRange(0, this.gridSize.y - 1));
            // Plant a mine on the selected tile
            if (!tile.containsMine) {
                tile.setMine();
                mines++;
            }
        }
        this.calculateNumberHints();
        this.minesAmount = mines;
    };
    Board.prototype.calculateNumberHints = function () {
        for (var y = 0; y < this.gridSize.y; y++) {
            for (var x = 0; x < this.gridSize.x; x++) {
                var tile = this.getTile(x, y);
                // Set the hint value to the amount of surrounding mines if the tile is not a mine itself
                if (!tile.containsMine) {
                    tile.setHintValue(this.countSurroundingMines(tile));
                }
                // Print the board in the console
                //console.log("", x, y, tile.hintValue);
            }
        }
    };
    Board.prototype.update = function (elapsedMiliseconds) {
        var _this = this;
        if (this.state == BoardStates.AutoRevealing) {
            // Update the auto revealing
            this.autoRevealingTimer += elapsedMiliseconds;
            if (this.autoRevealingTimer >= this.autoRevealingInterval) {
                this.autoRevealingTimer -= this.autoRevealingInterval;
                // Reveal all the tiles that are pending reveal
                this.tilesToReveal.forEach(function (tile) {
                    _this.revealTile(tile.gridLocation.x, tile.gridLocation.y);
                });
                // Add new tiles to reveal next
                var nextTiles = [];
                for (var i = 0; i < this.tilesToReveal.length; i++) {
                    if (this.tilesToReveal[i].hintValue == 0) {
                        // Put all the adjacent tiles in the array
                        this.getAllAdjacentTiles(this.tilesToReveal[i]).forEach(function (adjacent) {
                            // Add the tiles that are not revealed yet
                            if (!adjacent.isRevealed && !adjacent.isMarked) {
                                nextTiles.push(adjacent);
                            }
                        });
                    }
                }
                this.tilesToReveal = nextTiles;
                // Change the state back to normal when there are no more tiles to reveal
                if (this.tilesToReveal.length == 0) {
                    this.changeState(BoardStates.Active);
                }
            }
        }
    };
    Board.prototype.containsTile = function (posX, posY) {
        return posX >= 0 &&
            posY >= 0 &&
            posX < this.gridSize.x &&
            posY < this.gridSize.y;
    };
    Board.prototype.revealTile = function (posX, posY) {
        var revealedTile = this.getTile(posX, posY);
        // Stop the function if the tile is marked or revealed already
        if (revealedTile.isMarked || revealedTile.isRevealed) {
            return revealedTile;
        }
        revealedTile.reveal();
        // Count the amount of revealed tiles if it's not a mine
        if (!revealedTile.containsMine)
            this.tilesRevealed++;
        // When a tile with hintValue 0 is revealed, it auto reveals the surrounding tiles
        if (revealedTile.hintValue == 0 && this.state != BoardStates.AutoRevealing) {
            this.tilesToReveal = this.getAllAdjacentTiles(revealedTile);
            this.changeState(BoardStates.AutoRevealing);
        }
        return revealedTile;
    };
    Board.prototype.markTile = function (posX, posY) {
        var markedTile = this.tiles[posY][posX];
        // Unmark the tile if it's marked already
        if (markedTile.isMarked) {
            markedTile.unMark();
            this.markedAmount--;
        }
        // Only mark the tile if it's not revealed yet
        else if (!markedTile.isRevealed) {
            markedTile.mark();
            this.markedAmount++;
        }
    };
    Board.prototype.getTile = function (posX, posY) {
        if (!this.containsTile(posX, posY)) {
            // If the position is outside of the grid return undefined
            return undefined;
        }
        return this.tiles[posY][posX];
    };
    Board.prototype.countSurroundingMines = function (tile) {
        var mines = 0;
        for (var y = -1; y <= 1; y++) {
            for (var x = -1; x <= 1; x++) {
                // There is no need to check itself for a mine
                if (x == 0 && y == 0) {
                    continue;
                }
                // Count the mine of the adjacent tile
                var adjacentTile = this.getAdjacentTile(tile, x, y);
                if (adjacentTile != undefined && adjacentTile.containsMine) {
                    mines++;
                }
            }
        }
        return mines;
    };
    Board.prototype.getAdjacentTile = function (tile, nextX, nextY) {
        return this.getTile(tile.gridLocation.x + nextX, tile.gridLocation.y + nextY);
    };
    Board.prototype.getAllAdjacentTiles = function (tile) {
        var adjacentTiles = [];
        for (var y = -1; y <= 1; y++) {
            for (var x = -1; x <= 1; x++) {
                // There is no need to return itself
                if (x == 0 && y == 0) {
                    continue;
                }
                // Add the adjacent tile to the list if it's not undefined
                var adjacent = this.getAdjacentTile(tile, x, y);
                if (adjacent != undefined) {
                    adjacentTiles.push(adjacent);
                }
            }
        }
        return adjacentTiles;
    };
    Board.prototype.showAllMines = function () {
        for (var y = 0; y < this.gridSize.y; y++) {
            for (var x = 0; x < this.gridSize.x; x++) {
                var tile = this.getTile(x, y);
                // Reveal every tile that has a mine and is not revealed yet
                if (!tile.isRevealed && tile.containsMine) {
                    tile.reveal(false);
                }
            }
        }
    };
    Board.prototype.markAllMines = function () {
        for (var y = 0; y < this.gridSize.y; y++) {
            for (var x = 0; x < this.gridSize.x; x++) {
                var tile = this.getTile(x, y);
                // Mark every tile that has a mine and is not marked yet
                if (tile.containsMine && !tile.isMarked) {
                    tile.mark();
                }
            }
        }
    };
    // Selects a tile to give player feedback. Returns whether a new tile was selected then previously.
    Board.prototype.selectTile = function (x, y) {
        // If the tile that needs to be selected is already selected, cancel the function
        if (this.selectedTile != undefined && this.selectedTile.gridLocation.x == x && this.selectedTile.gridLocation.y == y) {
            return false;
        }
        // Deselect the old tile
        this.unselectCurrentTile();
        // If the location is not inside the grid, no tile can be selected
        // Return true so that the input thinks it's not holding down a tile
        if (!this.containsTile(x, y))
            return true;
        // Get the new selected tile
        this.selectedTile = this.getTile(x, y);
        // Select the new tile if it's not revealed yet
        if (!this.selectedTile.isRevealed) {
            this.selectedTile.select();
        }
        else {
            this.selectedTile = undefined;
        }
        return true;
    };
    Board.prototype.unselectCurrentTile = function () {
        if (this.selectedTile != undefined) {
            this.selectedTile.unselect();
            this.selectedTile = undefined;
        }
    };
    Board.prototype.changeState = function (newState) {
        this.state = newState;
    };
    // Converts a screen position to a location in the grid
    Board.prototype.toGridPosition = function (screenPosX, screenPosY) {
        return new Phaser.Geom.Point(Math.floor((screenPosX - this.boardPosition.x) / CELL_SIZE), Math.floor((screenPosY - this.boardPosition.y) / CELL_SIZE));
    };
    // Converts a grid location to a screen position
    Board.prototype.toScreenPosition = function (gridPosX, gridPosY) {
        return new Phaser.Geom.Point(Math.floor(this.boardPosition.x + gridPosX * CELL_SIZE), Math.floor(this.boardPosition.y + gridPosY * CELL_SIZE));
    };
    return Board;
}());
var TileFrames;
(function (TileFrames) {
    TileFrames[TileFrames["Hidden"] = 10] = "Hidden";
    TileFrames[TileFrames["Revealed"] = 11] = "Revealed";
    TileFrames[TileFrames["Mistake"] = 12] = "Mistake";
    TileFrames[TileFrames["Selected"] = 13] = "Selected";
    TileFrames[TileFrames["Mine"] = 22] = "Mine";
    TileFrames[TileFrames["Flag"] = 20] = "Flag";
})(TileFrames || (TileFrames = {}));
var Tile = /** @class */ (function () {
    function Tile(scene, position, gridLocationX, gridLocationY) {
        this.hintValue = 0;
        this.isRevealed = false;
        this.isMarked = false;
        this.scene = scene;
        // Create new sprite based on the spritesheet
        this.sprite = scene.add.sprite(0, 0, 'minesweeper_sheet');
        this.sprite.setOrigin(0, 0);
        // Show the hidden tile sprite from the spritesheet
        this.sprite.setFrame(TileFrames.Hidden);
        // Set the position based on the grid location
        this.sprite.setPosition(position.x, position.y);
        this.position = position;
        this.gridLocation = new Phaser.Geom.Point(gridLocationX, gridLocationY);
    }
    Object.defineProperty(Tile.prototype, "containsMine", {
        get: function () { return this.hintValue == -1; },
        enumerable: true,
        configurable: true
    });
    Tile.prototype.setMine = function () {
        this.hintValue = -1;
        // Debug Code (Shows where the mines are)
        //this.sprite.setFrame(TileFrames.Selected);
    };
    Tile.prototype.select = function () {
        this.sprite.setFrame(TileFrames.Selected);
    };
    Tile.prototype.unselect = function () {
        this.sprite.setFrame(TileFrames.Hidden);
    };
    Tile.prototype.reveal = function (showPlayerMistake) {
        if (showPlayerMistake === void 0) { showPlayerMistake = true; }
        this.isRevealed = true;
        this.sprite.setFrame(TileFrames.Revealed);
        if (this.containsMine) {
            // Show the player that they made a mistake by making the tile red
            if (showPlayerMistake) {
                this.sprite.setFrame(TileFrames.Mistake);
            }
            this.hintSprite = this.createSprite(TileFrames.Mine);
        }
        else if (this.hintValue > 0) {
            this.hintSprite = this.createSprite(this.hintValue - 1);
        }
    };
    Tile.prototype.setHintValue = function (value) {
        this.hintValue = value;
    };
    Tile.prototype.mark = function () {
        this.isMarked = true;
        // Create the mark sprite if it doesn't exists yet
        if (this.markSprite == undefined) {
            this.markSprite = this.createSprite(TileFrames.Flag);
            return;
        }
        this.markSprite.visible = true;
    };
    Tile.prototype.unMark = function () {
        this.isMarked = false;
        this.markSprite.visible = false;
    };
    Tile.prototype.createSprite = function (frame) {
        var newSprite = this.scene.add.sprite(0, 0, 'minesweeper_sheet');
        newSprite.setFrame(frame);
        newSprite.setOrigin(0, 0);
        newSprite.setPosition(this.position.x, this.position.y);
        return newSprite;
    };
    Tile.prototype.reset = function () {
        // Unmark the tile
        if (this.isMarked)
            this.unMark();
        // Destroy hint number or mine if it was shown to the player
        this.hintValue = 0;
        if (this.hintSprite != undefined)
            this.hintSprite.destroy();
        // Make the tile hidden again
        this.isRevealed = false;
        this.sprite.setFrame(TileFrames.Hidden);
    };
    return Tile;
}());
var WIN_TEXT_WIDTH = 480;
var WIN_TEXT_HEIGHT = 50;
var LOSE_TEXT_WIDTH = 284;
var LOSE_TEXT_HEIGHT = 50;
var END_TEXT_POSITION_Y = 132;
var EndScreen = /** @class */ (function () {
    function EndScreen(scene) {
        this.rectangle = scene.add.rectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 0, 0.5);
        this.rectangle.setOrigin(0, 0);
        this.winTextSprite = scene.add.sprite(SCREEN_WIDTH / 2, END_TEXT_POSITION_Y, 'ui');
        this.winTextSprite.frame = new Phaser.Textures.Frame(this.winTextSprite.texture, 'wintext', 0, 0, 0, WIN_TEXT_WIDTH, WIN_TEXT_HEIGHT);
        this.winTextSprite.setSizeToFrame(this.winTextSprite.frame);
        this.winTextSprite.setOrigin(0.5, 0.5);
        this.loseTextSprite = scene.add.sprite(SCREEN_WIDTH / 2, END_TEXT_POSITION_Y, 'ui');
        this.loseTextSprite.frame = new Phaser.Textures.Frame(this.loseTextSprite.texture, 'wintext', 0, 100, 50, LOSE_TEXT_WIDTH, LOSE_TEXT_HEIGHT);
        this.loseTextSprite.setSizeToFrame(this.loseTextSprite.frame);
        this.loseTextSprite.setOrigin(0.5, 0.5);
        this.hideEndScreen();
    }
    Object.defineProperty(EndScreen.prototype, "isVisible", {
        get: function () { return this.rectangle.visible; },
        enumerable: true,
        configurable: true
    });
    EndScreen.prototype.showEndScreen = function (won) {
        // Show the correct text
        var textSprite = won ? this.winTextSprite : this.loseTextSprite;
        textSprite.setVisible(true);
        // Make the background rectangle visible
        this.rectangle.setVisible(true);
    };
    EndScreen.prototype.hideEndScreen = function () {
        this.winTextSprite.setVisible(false);
        this.loseTextSprite.setVisible(false);
        this.rectangle.setVisible(false);
    };
    return EndScreen;
}());
var DIGIT_AMOUNT = 3;
var MINUS_SIGN_FRAME = 11;
var HUD = /** @class */ (function () {
    function HUD(scene, posX, posY, width) {
        this.position = new Phaser.Geom.Point(posX, posY);
        // Place the mines counter on the left
        this.minesDigitsSprites = this.createSpriteDigits(scene, this.position);
        this.updateMinesAmount(0);
        // Place the timer on the right
        var rightPos = new Phaser.Geom.Point(posX + width - TIMER_FONT_WIDTH * DIGIT_AMOUNT, posY);
        this.timeDigitsSprites = this.createSpriteDigits(scene, rightPos);
        this.updateTime(0);
    }
    // Creates an array of sprites as digits
    HUD.prototype.createSpriteDigits = function (scene, pos, digitAmoount) {
        if (digitAmoount === void 0) { digitAmoount = DIGIT_AMOUNT; }
        var digitSprites = [];
        // Add each digit as a sprite from right to left
        for (var i = digitAmoount - 1; i >= 0; i--) {
            var len = digitSprites.push(scene.add.sprite(pos.x + i * TIMER_FONT_WIDTH, pos.y, 'timer_font_sheet'));
            digitSprites[len - 1].setOrigin(0, 0);
        }
        return digitSprites;
    };
    HUD.prototype.updateMinesAmount = function (marks) {
        this.updateSpriteDigits(this.minesDigitsSprites, marks);
    };
    HUD.prototype.updateTime = function (time) {
        this.updateSpriteDigits(this.timeDigitsSprites, time);
    };
    // Update the digit sprites so that it matches a number
    HUD.prototype.updateSpriteDigits = function (digitSprites, num) {
        // Check if it's a minus number and calculate where the minus sign should be placed
        var minusSign = -1;
        if (num < 0) {
            minusSign = num.toString().length - 1;
            num *= -1;
        }
        // Keep track of the highest digit
        var highestDigit = 0;
        for (var i = digitSprites.length - 1; i >= 0; i--) {
            // Ignore the calculation if a minus sign needs to be placed
            if (i == minusSign) {
                digitSprites[i].setFrame(MINUS_SIGN_FRAME);
                continue;
            }
            // Calculate the current digit
            var powOfTen = Math.pow(10, i);
            var digit = Math.floor(num / powOfTen);
            // Show the 'off' digit instead of a 0 when the number doesn't have enough digits (so that 99 doesn't show as 099)
            var frame = digit == 0 && highestDigit == 0 && i != 0 ? 0 : digit + 1;
            // Show the correct digit
            digitSprites[i].setFrame(frame);
            // Remove the digit from the number so it won't mess up the calculation
            num -= digit * powOfTen;
            // Update the highest digit
            if (digit > highestDigit)
                highestDigit = digit;
        }
    };
    return HUD;
}());
var RESTART_BUTTON_SIZE = 100;
var Menu = /** @class */ (function () {
    function Menu(scene) {
        this.resetButtonSprite = scene.add.sprite(SCREEN_WIDTH - BOARD_POSITION_X - RESTART_BUTTON_SIZE, SCREEN_HEIGHT - RESTART_BUTTON_SIZE - BOARD_POSITION_X, 'ui');
        this.resetButtonSprite.frame = new Phaser.Textures.Frame(this.resetButtonSprite.texture, 'resetbutton', 0, 0, 50, RESTART_BUTTON_SIZE, RESTART_BUTTON_SIZE);
        this.resetButtonSprite.setOrigin(0, 0);
    }
    Menu.prototype.addRestartEvent = function (event) {
        this.resetButtonSprite.setInteractive();
        this.resetButtonSprite.on('pointerdown', event);
    };
    return Menu;
}());
var UIManager = /** @class */ (function () {
    function UIManager(scene) {
        this.endScreen = new EndScreen(scene);
        this.menu = new Menu(scene);
        this.hud = new HUD(scene, BOARD_POSITION_X, BOARD_POSITION_X, BOARD_WIDTH);
    }
    return UIManager;
}());
//# sourceMappingURL=game.js.map