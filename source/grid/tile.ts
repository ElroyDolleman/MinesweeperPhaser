enum TileFrames
{
    Hidden = 10,
    Revealed = 11,
    Mistake = 12,
    Mine = 20,
    Flag = 21
}

class Tile
{
    scene: Phaser.Scene;

    sprite: Phaser.GameObjects.Sprite;
    gridPosition: Phaser.Geom.Point;

    hintValue: number = 0;
    isRevealed: boolean = false;
    isMarked: boolean = false;

    get containsMine(): boolean { return this.hintValue == -1; }

    constructor(scene: Phaser.Scene, gridPosX: number, gridPosY: number)
    {
        this.scene = scene;

        // Create new sprite based on the spritesheet
        this.sprite = scene.add.sprite(0, 0, 'minesweeper_sheet');
        this.sprite.setOrigin(0, 0);

        // Show the hidden tile sprite from the spritesheet
        this.sprite.setFrame(TileFrames.Hidden);

        // Set the position based on the grid location
        this.sprite.setPosition(gridPosX * CELL_SIZE, gridPosY * CELL_SIZE);
        this.gridPosition = new Phaser.Geom.Point(gridPosX, gridPosY);
    }

    setMine()
    {
        this.hintValue = -1;
    }

    reveal()
    {
        this.isRevealed = true;
        this.sprite.setFrame(TileFrames.Revealed);

        if (this.containsMine)
        {
            this.sprite.setFrame(TileFrames.Mistake);

            // Show the mine sprite
            var mineSprite = this.scene.add.sprite(0, 0, 'minesweeper_sheet');
            mineSprite.setFrame(TileFrames.Mine);
            mineSprite.setOrigin(0, 0);
            mineSprite.setPosition(this.gridPosition.x * CELL_SIZE, this.gridPosition.y * CELL_SIZE);
        }
        else if (this.hintValue > 0)
        {
            var numberSprite = this.scene.add.sprite(0, 0, 'minesweeper_sheet');
            numberSprite.setFrame(this.hintValue - 1);
            numberSprite.setOrigin(0, 0);
            numberSprite.setPosition(this.gridPosition.x * CELL_SIZE, this.gridPosition.y * CELL_SIZE);
        }
    }

    setHintValue(value: number)
    {
        this.hintValue = value;
    }

    mark()
    {
        this.isMarked = true;
    }
}