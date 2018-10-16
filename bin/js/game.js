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
var CELL_SIZE = 44;
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
        // Create the board/grid
        this.board = new Board(this, new Phaser.Geom.Point(0, 0), 10, 10);
        // The input event for clicking on the screen
        this.input.on('pointerdown', function (pointer) {
            // Calculate the grid location that was clicked
            var gridPosClick = this.board.toGridPosition(pointer.x, pointer.y);
            // Check if the click happened in the grid
            if (this.board.containsTile(gridPosClick.x, gridPosClick.y)) {
                // Reveal the tile that was clicked
                this.board.revealTile(gridPosClick.x, gridPosClick.y);
            }
        }, this);
    };
    GameScene.prototype.update = function () {
    };
    return GameScene;
}(Phaser.Scene));
var config = {
    type: Phaser.AUTO,
    width: 480,
    height: 800,
    backgroundColor: '#ffffff',
    parent: 'minesweeper',
    scene: [GameScene]
};
var game = new Phaser.Game(config);
var Board = /** @class */ (function () {
    function Board(scene, boardPosition, gridWidth, gridHeight) {
        this.gridSize = new Phaser.Geom.Point(gridWidth, gridHeight);
        this.boardPosition = boardPosition;
        this.createBoard(scene);
    }
    Object.defineProperty(Board.prototype, "totalTiles", {
        get: function () { return this.gridSize.x * this.gridSize.y; },
        enumerable: true,
        configurable: true
    });
    Board.prototype.createBoard = function (scene) {
        this.tiles = [];
        for (var y = 0; y < this.gridSize.y; y++) {
            // Add a new row
            this.tiles.push([]);
            for (var x = 0; x < this.gridSize.x; x++) {
                // Add a new tile on each grid cell
                this.tiles[y].push(new Tile(scene, x, y));
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
        revealedTile.reveal();
        return revealedTile;
    };
    Board.prototype.markTile = function (posX, posY) {
        var markedTile = this.tiles[posY][posX];
        markedTile.mark();
    };
    Board.prototype.getTile = function (posX, posY) {
        return this.tiles[posY][posX];
    };
    Board.prototype.countSurroundingMines = function (tile) {
        var mines = 0;
        for (var y = -1; y < 1; y++) {
            for (var x = -1; x < 1; x++) {
                // There is no need to check itself for a mine
                if (x == 0 && y == 0) {
                    continue;
                }
                // Count the mine of the adjacent tile
                if (this.getAdjacentTile(tile, x, y).containsMine) {
                    mines++;
                }
            }
        }
        return mines;
    };
    Board.prototype.getAdjacentTile = function (tile, nextX, nextY) {
        return this.getTile(tile.gridPosition.y + nextY, tile.gridPosition.x + nextX);
    };
    Board.prototype.getAllAdjacentTiles = function (tile) {
        var adjacentTiles = [];
        for (var y = -1; y < 1; y++) {
            for (var x = -1; x < 1; x++) {
                // There is no need to return itself
                if (x == 0 && y == 0) {
                    continue;
                }
                adjacentTiles.push(this.getAdjacentTile(tile, x, y));
            }
        }
        return adjacentTiles;
    };
    // Converts a screen position to a location in the grid
    Board.prototype.toGridPosition = function (screenPosX, screenPosY) {
        return new Phaser.Geom.Point(Math.floor((screenPosX - this.boardPosition.x) / CELL_SIZE), Math.floor((screenPosY - this.boardPosition.y) / CELL_SIZE));
    };
    return Board;
}());
var TileFrames;
(function (TileFrames) {
    TileFrames[TileFrames["Hidden"] = 10] = "Hidden";
    TileFrames[TileFrames["Revealed"] = 11] = "Revealed";
    TileFrames[TileFrames["Mistake"] = 12] = "Mistake";
})(TileFrames || (TileFrames = {}));
var Tile = /** @class */ (function () {
    function Tile(scene, gridPosX, gridPosY) {
        this.value = 0;
        this.isRevealed = false;
        this.isMarked = false;
        // Create new sprite based on the spritesheet
        this.sprite = scene.add.sprite(0, 0, 'minesweeper_sheet');
        this.sprite.setOrigin(0, 0);
        // Show the hidden tile sprite from the spritesheet
        this.sprite.setFrame(TileFrames.Hidden);
        // Set the position based on the grid location
        this.sprite.setPosition(gridPosX * CELL_SIZE, gridPosY * CELL_SIZE);
        this.gridPosition = new Phaser.Geom.Point(gridPosX, gridPosY);
    }
    Object.defineProperty(Tile.prototype, "containsMine", {
        get: function () { return this.value == -1; },
        enumerable: true,
        configurable: true
    });
    Tile.prototype.setMine = function () {
        this.value = -1;
    };
    Tile.prototype.reveal = function () {
        this.isRevealed = true;
        this.sprite.setFrame(TileFrames.Revealed);
    };
    Tile.prototype.mark = function () {
        this.isMarked = true;
    };
    return Tile;
}());
//# sourceMappingURL=game.js.map