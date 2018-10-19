const BOT_MOVE_INTERVAL = 600;

class Bot
{
    board: Board;
    step: number = 0;
    currentStepSucces: boolean = true;
    
    revealActionCallback: (gridPos: Phaser.Geom.Point) => any;
    markActionCallback: (gridPos: Phaser.Geom.Point) => any;

    tilesToMark: Array<Tile> = [];
    tilesToReveal: Array<Tile> = [];

    timer: number = 0;

    constructor(board: Board)
    {
        this.board = board;
    }
    
    update()
    {
        this.timer += FIXED_TIMESTEP;

        // Stop the update if it's not ready to perform the next action
        if (this.timer < BOT_MOVE_INTERVAL)
        {
            return;
        }
        this.timer -= BOT_MOVE_INTERVAL;

        // Reveal the next tile if there are any to reveal
        if (this.tilesToReveal.length > 0)
        {
            this.revealActionCallback(this.tilesToReveal[0].gridLocation);
            this.tilesToReveal.splice(0, 1);
        }
        // Mark the next tile if there are any to mark
        else if (this.tilesToMark.length > 0)
        {
            this.markActionCallback(this.tilesToMark[0].gridLocation);
            this.tilesToMark.splice(0, 1);
        }
        // Perform the next step if there is nothing to reveal or mark
        else
        {
            this.nextStep();
        }
    }

    nextStep()
    {
        this.step++;

        // When all the mines are marked, reveal the remaining tiles
        if ((this.board.minesAmount - this.board.markedAmount) == 0)
        {
            this.tilesToReveal = this.board.getAllUnrevealed();
            return;
        }

        switch(this.step)
        {
            case 1: 
                this.revealRandom();
                this.currentStepSucces = true;
                break;
            case 2: 
                this.currentStepSucces = this.markAllCertainMines(); 
                break;
            case 3: 
                this.currentStepSucces = this.revealAllCertainSafeTiles(); 
                break;
        }

        // Immediately go the next step if this step was not succesful
        if (!this.currentStepSucces)
        {
            // Go back to the first step if the last step was completed
            if (this.step == 3) this.step = 0;

            this.nextStep();
        }
        else if (this.step >= 3)
        {
            // Go back to the second step if the last step was succesfull since the first step is luck based
            this.step = 1;
        }
    }

    // Randomly reveal a tile
    revealRandom()
    {
        let x = Phaser.Math.RND.integerInRange(0, this.board.gridSize.x - 1);
        let y = Phaser.Math.RND.integerInRange(0, this.board.gridSize.y - 1);

        let tile = this.board.getTile(x, y);

        if (!tile.isRevealed && !tile.isMarked)
        {
            this.revealActionCallback(tile.gridLocation);
        }
        else
        {
            // Brute force until it chooses a tile that is both not marked and not revealed
            this.revealRandom();
        }
    }

    // Mark evey tile that is 100% sure a mine
    markAllCertainMines(): boolean
    {
        let madeAMove = false;

        for (var y = 0; y < this.board.gridSize.y; y++)
        {
            for (var x = 0; x < this.board.gridSize.x; x++)
            {
                let tile = this.board.getTile(x, y);
                
                if (tile.isRevealed && tile.hintValue > 0)
                {
                    // Get all adjacent tiles that are not revealed yet
                    let adjacentTiles = this.board.getAllAdjacentTiles(tile, true);

                    // Continue the for loop if the hint value is different than the surrounding unrevealed tiles
                    if (adjacentTiles.length != tile.hintValue) continue;

                    // Reveal the tiles
                    adjacentTiles.forEach(adjacent => {
                        if (!adjacent.isMarked && this.tilesToMark.indexOf(adjacent) < 0)
                        {
                            madeAMove = true;
                            this.tilesToMark.push(adjacent);
                        }
                    });
                }
            }
        }

        return madeAMove;
    }

    revealAllCertainSafeTiles(): boolean
    {
        let madeAMove = false;

        for (var y = 0; y < this.board.gridSize.y; y++)
        {
            for (var x = 0; x < this.board.gridSize.x; x++)
            {
                let tile = this.board.getTile(x, y);
                
                if (tile.isRevealed && tile.hintValue > 0)
                {
                    // Get all adjacent tiles that are not revealed yet
                    let adjacentTiles = this.board.getAllAdjacentTiles(tile, true);                    

                    // Count how many tiles are marked
                    let markedAmount = 0;
                    adjacentTiles.forEach(adjacent => {
                        if (adjacent.isMarked)
                        {
                            markedAmount++;
                        }
                    });

                    // Continue the for loop if all unrevealed tiles are marked already
                    if (adjacentTiles.length == markedAmount) continue;

                    // Continue the loop if it's not certain whether there is a mine or not
                    if (tile.hintValue != markedAmount) continue;

                    // Reveal all tiles that are not marked
                    adjacentTiles.forEach(adjacent => {
                        if (!adjacent.isMarked && this.tilesToReveal.indexOf(adjacent) < 0)
                        {
                            madeAMove = true;
                            this.tilesToReveal.push(adjacent);
                        }
                    });
                }
            }
        }

        return madeAMove;
    }
}