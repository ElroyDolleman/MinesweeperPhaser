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
var GameScene = /** @class */ (function (_super) {
    __extends(GameScene, _super);
    function GameScene() {
        return _super.call(this, { key: 'GameScene', active: true }) || this;
    }
    GameScene.prototype.preload = function () {
        // Load the spritesheet that contains all images
        this.load.spritesheet('minesweeper_sheet', 'assets/minesweeper_sheet.png', { frameWidth: CELL_SIZE, frameHeight: CELL_SIZE });
    };
    GameScene.prototype.create = function () {
        game.input.mouse.capture = true;
        // Create the board/grid
        this.board = new Board(this, 9, 9);
        this.board.setBoardPosition(SCREEN_WIDTH / 2 - this.board.boardWidth / 2, SCREEN_HEIGHT / 2 - this.board.boardHeight / 2);
        this.board.createBoard(this);
        this.board.placeMines(10);
        // The input event for clicking on the screen
        this.input.on('pointerdown', function (pointer) {
            // If the board is a state that disables input, end this function
            if (!this.board.inputEnabled) {
                return;
            }
            // Calculate the grid location that was clicked
            var gridPosClick = this.board.toGridPosition(pointer.x, pointer.y);
            // If the right button is down, mark the tile instead of revealing it
            if (pointer.rightButtonDown()) {
                // Mark the tile that the player clicks on (will automatically unmark if it's marked already)
                if (this.board.containsTile(gridPosClick.x, gridPosClick.y)) {
                    this.board.markTile(gridPosClick.x, gridPosClick.y);
                }
                // Quit the function to prevent revealing the tile
                return;
            }
            // Check if the click happened in the grid
            if (this.board.containsTile(gridPosClick.x, gridPosClick.y)) {
                // Reveal the tile that was clicked
                var revealedTile = this.board.revealTile(gridPosClick.x, gridPosClick.y);
                // When the revealed tile has a mine, it's game over
                if (!revealedTile.isMarked && revealedTile.containsMine) {
                    // Show the player where all the mines are
                    this.board.showAllMines();
                    // Tell the board that it's game over
                    this.board.changeState(BoardStates.GameOver);
                }
            }
        }, this);
    };
    GameScene.prototype.update = function (time, delta) {
        this.board.update(1000 / 60);
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
    BoardStates[BoardStates["Normal"] = 0] = "Normal";
    BoardStates[BoardStates["AutoRevealing"] = 1] = "AutoRevealing";
    BoardStates[BoardStates["GameOver"] = 2] = "GameOver";
})(BoardStates || (BoardStates = {}));
var Board = /** @class */ (function () {
    function Board(scene, gridWidth, gridHeight) {
        this.state = BoardStates.Normal;
        this.autoRevealingSpeed = 132; // Miliseconds
        this.autoRevealingTimer = 0;
        this.gridSize = new Phaser.Geom.Point(gridWidth, gridHeight);
    }
    Object.defineProperty(Board.prototype, "totalTiles", {
        // The total amount of tiles
        get: function () { return this.gridSize.x * this.gridSize.y; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Board.prototype, "inputEnabled", {
        // Whether input can make changes to the board or not
        get: function () { return this.state == BoardStates.Normal; },
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
                this.tiles[y].push(new Tile(scene, this.toScreenPosition(x, y)));
            }
        }
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
        if (this.state == BoardStates.AutoRevealing) {
            // Update the auto revealing
            this.autoRevealingTimer += elapsedMiliseconds;
            if (this.autoRevealingTimer >= this.autoRevealingSpeed) {
                this.autoRevealingTimer -= this.autoRevealingSpeed;
                // Reveal all the tiles that are pending reveal
                this.tilesToReveal.forEach(function (tile) {
                    tile.reveal();
                });
                // Add new tiles to reveal next
                var nextTiles = [];
                for (var i = 0; i < this.tilesToReveal.length; i++) {
                    if (this.tilesToReveal[i].hintValue == 0) {
                        // Put all the adjacent tiles in the array
                        this.getAllAdjacentTiles(this.tilesToReveal[i]).forEach(function (adjacent) {
                            // Add the tiles that are not revealed yet
                            if (!adjacent.isRevealed) {
                                nextTiles.push(adjacent);
                            }
                        });
                    }
                }
                this.tilesToReveal = nextTiles;
                // Change the state back to normal when there are no more tiles to reveal
                if (this.tilesToReveal.length == 0) {
                    this.changeState(BoardStates.Normal);
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
        // Stop the function if the tile is marked
        if (revealedTile.isMarked) {
            return revealedTile;
        }
        revealedTile.reveal();
        // When a tile with hintValue 0 is revealed, it auto reveals the surrounding tiles
        if (revealedTile.hintValue == 0) {
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
        }
        // Only mark the tile if it's not revealed yet
        else if (!markedTile.isRevealed) {
            markedTile.mark();
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
        var gridpos = this.toGridPosition(tile.position.x, tile.position.y);
        return this.getTile(gridpos.x + nextX, gridpos.y + nextY);
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
    TileFrames[TileFrames["Hidden"] = 9] = "Hidden";
    TileFrames[TileFrames["Revealed"] = 10] = "Revealed";
    TileFrames[TileFrames["Mistake"] = 11] = "Mistake";
    TileFrames[TileFrames["Mine"] = 20] = "Mine";
    TileFrames[TileFrames["Flag"] = 18] = "Flag";
})(TileFrames || (TileFrames = {}));
var Tile = /** @class */ (function () {
    function Tile(scene, position) {
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
    }
    Object.defineProperty(Tile.prototype, "containsMine", {
        get: function () { return this.hintValue == -1; },
        enumerable: true,
        configurable: true
    });
    Tile.prototype.setMine = function () {
        this.hintValue = -1;
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
            this.createSprite(TileFrames.Mine);
        }
        else if (this.hintValue > 0) {
            this.createSprite(this.hintValue - 1);
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
    return Tile;
}());
//# sourceMappingURL=game.js.map