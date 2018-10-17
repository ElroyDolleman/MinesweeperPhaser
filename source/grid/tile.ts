enum TileFrames
{
    Hidden = 10,
    Revealed = 11,
    Mistake = 12,
    Mine = 22,
    Flag = 20
}

class Tile
{
    scene: Phaser.Scene;

    markSprite: Phaser.GameObjects.Sprite;
    sprite: Phaser.GameObjects.Sprite;
    position: Phaser.Geom.Point;

    hintValue: number = 0;
    isRevealed: boolean = false;
    isMarked: boolean = false;

    get containsMine(): boolean { return this.hintValue == -1; }

    constructor(scene: Phaser.Scene, position: Phaser.Geom.Point)
    {
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

    setMine()
    {
        this.hintValue = -1;
    }

    reveal(showPlayerMistake: boolean = true)
    {
        this.isRevealed = true;
        this.sprite.setFrame(TileFrames.Revealed);

        if (this.containsMine)
        {
            // Show the player that they made a mistake by making the tile red
            if (showPlayerMistake)
            {
                this.sprite.setFrame(TileFrames.Mistake);
            }
            this.createSprite(TileFrames.Mine);
            
        }
        else if (this.hintValue > 0)
        {
            this.createSprite(this.hintValue - 1);
        }
    }

    setHintValue(value: number)
    {
        this.hintValue = value;
    }

    mark()
    {
        this.isMarked = true;

        // Create the mark sprite if it doesn't exists yet
        if (this.markSprite == undefined)
        {
            this.markSprite = this.createSprite(TileFrames.Flag);
            return;
        }

        this.markSprite.visible = true;
    }

    unMark()
    {
        this.isMarked = false;
        this.markSprite.visible = false;
    }

    createSprite(frame: TileFrames): Phaser.GameObjects.Sprite
    {
        var newSprite = this.scene.add.sprite(0, 0, 'minesweeper_sheet');
        newSprite.setFrame(frame);
        newSprite.setOrigin(0, 0);
        newSprite.setPosition(this.position.x, this.position.y);

        return newSprite;
    }
}