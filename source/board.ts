class Board
{
    position: Phaser.Geom.Point;  // The position of the board
    gridSize: Phaser.Geom.Point;  // The widht and height of the grid
    tiles: Array<Array<Tile>>;    // The tiles stored in a 2D array

    get totalTiles(): number { return this.gridSize.x * this.gridSize.y; }


    constructor(boardPosition: Phaser.Geom.Point, gridWidth: number, gridHeight: number)
    {
        this.gridSize = new Phaser.Geom.Point(10, 10);
        this.position = boardPosition;
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
        return this.tiles[posY][posX];
    }

    countSurroundingMines(tile: Tile): number
    {
        var mines = 0;

        for (var y = -1; y < 1; y++)
        {
            for (var x = -1; x < 1; x++)
            {
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
    }

    getAdjacentTile(tile: Tile, nextX: number, nextY: number): Tile
    {
        return this.getTile(tile.position.y + nextY, tile.position.x + nextX);
    }
}