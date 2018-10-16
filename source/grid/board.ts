class Board
{
    boardPosition: Phaser.Geom.Point;  // The position of the board
    gridSize: Phaser.Geom.Point;  // The widht and height of the grid
    tiles: Array<Array<Tile>>;    // The tiles stored in a 2D array

    get totalTiles(): number { return this.gridSize.x * this.gridSize.y; }


    constructor(scene: Phaser.Scene, boardPosition: Phaser.Geom.Point, gridWidth: number, gridHeight: number)
    {
        this.gridSize = new Phaser.Geom.Point(gridWidth, gridHeight);
        this.boardPosition = boardPosition;

        this.createBoard(scene);
    }

    createBoard(scene: Phaser.Scene)
    {
        this.tiles = [];

        for (var y = 0; y < this.gridSize.y; y++)
        {
            // Add a new row
            this.tiles.push([]);

            for (var x = 0; x < this.gridSize.x; x++)
            {
                // Add a new tile on each grid cell
                this.tiles[y].push(new Tile(scene, x, y));
            }
        }
    }

    placeMines(amount: number)
    {
        var mines = 0;

        while(mines < amount)
        {
            // Randomly select a tile
            var tile = this.getTile(
                Phaser.Math.RND.integerInRange(0, this.gridSize.x - 1),
                Phaser.Math.RND.integerInRange(0, this.gridSize.y - 1)
            );

            // Plant a mine on the selected tile
            if (!tile.containsMine)
            {
                tile.setMine();
                mines++;
            }
        }

        this.calculateNumberHints();
    }

    calculateNumberHints()
    {
        for (var y = 0; y < this.gridSize.y; y++)
        {
            for (var x = 0; x < this.gridSize.x; x++)
            {
                var tile = this.getTile(x, y);

                // Set the hint value to the amount of surrounding mines if the tile is not a mine itself
                if (!tile.containsMine)
                {
                    tile.setHintValue(this.countSurroundingMines(tile));
                }
            }
        }
    }

    containsTile(posX: number, posY: number): boolean
    {
        return posX >= 0 &&
            posY >= 0 &&
            posX < this.gridSize.x && 
            posY < this.gridSize.y;
    }

    revealTile(posX: number, posY: number): Tile
    {
        var revealedTile = this.getTile(posX, posY);
        revealedTile.reveal();

        return revealedTile;
    }

    markTile(posX: number, posY: number)
    {
        var markedTile = this.tiles[posY][posX];
        markedTile.mark();
    }

    getTile(posX: number, posY: number): Tile
    {
        if (!this.containsTile(posX, posY))
        {
            // If the position is outside of the grid return undefined
            return undefined;
        }

        return this.tiles[posY][posX];
    }

    countSurroundingMines(tile: Tile): number
    {
        var mines = 0;

        for (var y = -1; y <= 1; y++)
        {
            for (var x = -1; x <= 1; x++)
            {
                // There is no need to check itself for a mine
                if (x == 0 && y == 0) {
                    continue;
                }

                // Count the mine of the adjacent tile
                var adjacentTile = this.getAdjacentTile(tile, x, y);
                if (adjacentTile != undefined && adjacentTile.containsMine) 
                {
                    mines++;
                }
            }
        }

        return mines;
    }

    getAdjacentTile(tile: Tile, nextX: number, nextY: number): Tile
    {
        return this.getTile(tile.gridPosition.x + nextX, tile.gridPosition.y + nextY);
    }

    getAllAdjacentTiles(tile: Tile): Array<Tile>
    {
        var adjacentTiles = [];

        for (var y = -1; y < 1; y++)
        {
            for (var x = -1; x < 1; x++)
            {
                // There is no need to return itself
                if (x == 0 && y == 0) {
                    continue;
                }

                // Add the adjacent tile to the list if it's not undefined
                var adjacent = this.getAdjacentTile(tile, x, y);
                if (adjacent != undefined) 
                {
                    adjacentTiles.push(adjacent);
                }
            }
        }

        return adjacentTiles;
    }

    // Converts a screen position to a location in the grid
    toGridPosition(screenPosX: number, screenPosY: number): Phaser.Geom.Point
    {
        return new Phaser.Geom.Point(
            Math.floor((screenPosX - this.boardPosition.x) / CELL_SIZE),  
            Math.floor((screenPosY - this.boardPosition.y) / CELL_SIZE),
        );
    }
}