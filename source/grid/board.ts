enum BoardStates
{
    Active,
    AutoRevealing,
    Inactive,
}

class Board
{
    state: BoardStates = BoardStates.Active;

    autoRevealingInterval: number = 132; // Miliseconds
    autoRevealingTimer: number = 0;

    boardPosition: Phaser.Geom.Point; // The position of the board
    gridSize: Phaser.Geom.Point; // The width and height of the grid

    selectedTile: Tile; // The tile that is currently selected
    tiles: Array<Array<Tile>>; // The tiles stored in a 2D array
    tilesToReveal: Array<Tile>; // The tiles that are pending reveal (this is used for chains of zeros)
    tileGroup: Phaser.GameObjects.Group; // All sprites from the tiles will be put in this group
    
    tilesRevealed: number = 0; // The amount of tiles that are revealed
    minesAmount: number; // The amount of mines that the board has
    markedAmount: number = 0; // The amount of tiles that are marked

    private visible: boolean = true;

    // The total amount of tiles
    get totalTiles(): number { return this.gridSize.x * this.gridSize.y; }

    // Whether input can make changes to the board or not
    get isInteractive(): boolean { return this.state == BoardStates.Active && this.visible; }

    // The width and height of the board in pixels
    get boardWidth(): number { return this.gridSize.x * CELL_SIZE; }
    get boardHeight(): number { return this.gridSize.y * CELL_SIZE; }

    // The amount of tiles that are still unrevealed
    get unrevealedTiles(): number { return this.totalTiles - this.tilesRevealed; }

    // Whether all the tiles that are not mines are revealed
    get allSafeTilesAreRevealed(): boolean { return this.unrevealedTiles == this.minesAmount; }


    constructor()
    {
        // Can't interact with the board until the tiles are created
        this.changeState(BoardStates.Inactive);
    }

    setBoardSize(gridWidth: number, gridHeight: number)
    {
        this.gridSize = new Phaser.Geom.Point(gridWidth, gridHeight);
    }

    setBoardPosition(x: number, y: number)
    {
        this.boardPosition = new Phaser.Geom.Point(x, y);
    }

    create(scene: Phaser.Scene)
    {
        // Destroy the already existing sprites
        if (this.tileGroup != null)
        {
            this.tileGroup.clear(true, true);
            this.tileGroup.destroy();
            this.tileGroup = null;
        }

        // Create a new group for adding all the tile sprites (makes it easier to hide and destroy everything at once)
        this.tileGroup = scene.add.group();

        // Empty the array
        this.tiles = [];

        // Set the board on the correct position
        this.setBoardPosition(SCREEN_WIDTH / 2 - this.boardWidth / 2, SCREEN_HEIGHT / 2 - this.boardHeight / 2);

        // Create a new 2d array of tiles
        for (var y = 0; y < this.gridSize.y; y++)
        {
            // Add a new row
            this.tiles.push([]);

            for (var x = 0; x < this.gridSize.x; x++)
            {
                // Add a new tile on each grid cell
                this.tiles[y].push(new Tile(scene, this.tileGroup, this.toScreenPosition(x, y), x, y));
            }
        }

        // The board is now active since it's created
        this.changeState(BoardStates.Active);
    }

    reset()
    {
        for (var y = 0; y < this.gridSize.y; y++)
        {
            for (var x = 0; x < this.gridSize.x; x++)
            {
                this.tiles[y][x].reset();
            }
        }

        this.markedAmount = 0;
        this.tilesRevealed = 0;
        this.placeMines(this.minesAmount);

        this.changeState(BoardStates.Active);
    }

    destroy()
    {
        // Destroy the already existing sprites
        if (this.tileGroup != null)
        {
            this.tileGroup.clear(true, true);
            this.tileGroup.destroy();
            this.tileGroup = null;
        }

        this.markedAmount = 0;
        this.tilesRevealed = 0;
        this.minesAmount = 0;
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
        this.minesAmount = mines;
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

                // Print the board in the console
                //console.log("", x, y, tile.hintValue);
            }
        }
    }

    update(elapsedMiliseconds: number)
    {
        if (this.state == BoardStates.AutoRevealing)
        {
            // Update the auto revealing
            this.autoRevealingTimer += elapsedMiliseconds;
            if (this.autoRevealingTimer >= this.autoRevealingInterval)
            {
                this.autoRevealingTimer -= this.autoRevealingInterval;

                // Reveal all the tiles that are pending reveal
                this.tilesToReveal.forEach(tile => {
                    this.revealTile(tile.gridLocation.x, tile.gridLocation.y);
                });

                // Add new tiles to reveal next
                var nextTiles = [];
                for(var i = 0; i < this.tilesToReveal.length; i++)
                {
                    if (this.tilesToReveal[i].hintValue == 0)
                    {
                        // Put all the adjacent tiles in the array
                        this.getAllAdjacentTiles(this.tilesToReveal[i]).forEach(adjacent => {
                        
                            // Add the tiles that are not revealed yet
                            if (!adjacent.isRevealed && !adjacent.isMarked)
                            {
                                nextTiles.push(adjacent);
                            }
                        });
                    }
                }
                this.tilesToReveal = nextTiles;

                // Change the state back to normal when there are no more tiles to reveal
                if (this.tilesToReveal.length == 0)
                {
                    this.changeState(BoardStates.Active);
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

        // Stop the function if the tile is marked or revealed already
        if (revealedTile.isMarked || revealedTile.isRevealed)
        {
            return revealedTile;
        }

        revealedTile.reveal();

        // Count the amount of revealed tiles if it's not a mine
        if (!revealedTile.containsMine) this.tilesRevealed++;

        // When a tile with hintValue 0 is revealed, it auto reveals the surrounding tiles
        if (revealedTile.hintValue == 0 && this.state != BoardStates.AutoRevealing)
        {
            this.tilesToReveal = this.getAllAdjacentTiles(revealedTile);
            this.changeState(BoardStates.AutoRevealing);            
        }

        return revealedTile;
    }

    markTile(posX: number, posY: number)
    {
        var markedTile = this.tiles[posY][posX];

        // Unmark the tile if it's marked already
        if (markedTile.isMarked)
        {
            markedTile.unMark();
            this.markedAmount--;
        }

        // Only mark the tile if it's not revealed yet
        else if (!markedTile.isRevealed)
        {
            markedTile.mark();
            this.markedAmount++
        }
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
        return this.getTile(tile.gridLocation.x + nextX, tile.gridLocation.y + nextY);
    }

    getAllAdjacentTiles(tile: Tile): Array<Tile>
    {
        var adjacentTiles = [];

        for (var y = -1; y <= 1; y++)
        {
            for (var x = -1; x <= 1; x++)
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

    showAllMines()
    {
        for (var y = 0; y < this.gridSize.y; y++)
        {
            for (var x = 0; x < this.gridSize.x; x++)
            {
                var tile = this.getTile(x, y);

                // Reveal every tile that has a mine and is not revealed yet
                if (!tile.isRevealed && tile.containsMine)
                {
                    tile.reveal(false);
                }
            }
        }
    }

    markAllMines()
    {
        for (var y = 0; y < this.gridSize.y; y++)
        {
            for (var x = 0; x < this.gridSize.x; x++)
            {
                var tile = this.getTile(x, y);

                // Mark every tile that has a mine and is not marked yet
                if (tile.containsMine && !tile.isMarked)
                {
                    tile.mark();
                }
            }
        }
    }

    // Selects a tile to give player feedback. Returns whether a new tile was selected then previously.
    selectTile(x: number, y: number): boolean
    {
        // If the tile that needs to be selected is already selected, cancel the function
        if (this.selectedTile != undefined && this.selectedTile.gridLocation.x == x && this.selectedTile.gridLocation.y == y)
        {
            return false;
        }

        // Deselect the old tile
        this.unselectCurrentTile();

        // If the location is not inside the grid, no tile can be selected
        // Return true so that the input thinks it's not holding down a tile
        if (!this.containsTile(x, y)) return true;

        // Get the new selected tile
        this.selectedTile = this.getTile(x, y);
        
        // Select the new tile if it's not revealed yet
        if (!this.selectedTile.isRevealed)
        {
            this.selectedTile.select();
        }
        else
        {
            this.selectedTile = undefined;
        }

        return true;
    }

    unselectCurrentTile()
    {
        if (this.selectedTile != undefined)
        {
            this.selectedTile.unselect();
            this.selectedTile = undefined;
        }
    }

    changeState(newState: BoardStates)
    {
        this.state = newState;
    }

    toggleVisible()
    {
        this.tileGroup.toggleVisible();
    }

    // Changes the depth of the board so it can be put behind other sprite such as menus
    setBoardDepth(depth: number)
    {
        this.tileGroup.setDepth(depth, 0);

        // Make sure that the marks are on top
        for (var y = 0; y < this.gridSize.y; y++)
        {
            for (var x = 0; x < this.gridSize.x; x++)
            {
                if (this.tiles[y][x].isMarked)
                {
                    this.tiles[y][x].markSprite.setDepth(depth + 1);
                }
            }
        }
    }

    // Converts a screen position to a location in the grid
    toGridPosition(screenPosX: number, screenPosY: number): Phaser.Geom.Point
    {
        return new Phaser.Geom.Point(
            Math.floor((screenPosX - this.boardPosition.x) / CELL_SIZE),  
            Math.floor((screenPosY - this.boardPosition.y) / CELL_SIZE),
        );
    }

    // Converts a grid location to a screen position
    toScreenPosition(gridPosX: number, gridPosY: number): Phaser.Geom.Point
    {
        return new Phaser.Geom.Point(
            Math.floor(this.boardPosition.x + gridPosX * CELL_SIZE),  
            Math.floor(this.boardPosition.y + gridPosY * CELL_SIZE),
        );
    }
}