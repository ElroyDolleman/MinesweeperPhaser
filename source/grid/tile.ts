enum TileFrames
{
    Hidden = 10,
    Revealed = 11,
    Mistake = 12
}

class Tile
{
    sprite: Phaser.GameObjects.Sprite;
    gridPosition: Phaser.Geom.Point;

    value: number = 0;
    isRevealed: boolean = false;
    isMarked: boolean = false;

    get containsMine(): boolean { return this.value == -1; }

    constructor(scene: Phaser.Scene, gridPosX: number, gridPosY: number)
    {
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
        this.value = -1;
    }

    reveal()
    {
        this.isRevealed = true;
        this.sprite.setFrame(TileFrames.Revealed);
    }

    mark()
    {
        this.isMarked = true;
    }
}