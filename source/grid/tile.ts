enum TileFrames
{
    Hidden = 10,
    Revealed = 11,
    Mistake = 12,
    Selected = 13,
    Mine = 22,
    Flag = 20
}

class Tile
{
    scene: Phaser.Scene;
    group: Phaser.GameObjects.Group;

    hintSprite: Phaser.GameObjects.Sprite; // The number that indicates how many mines are surrounding this tile (-1 means it's a mine)
    markSprite: Phaser.GameObjects.Sprite; // The mark sprite that goes on top of the tile when the player marks it
    sprite: Phaser.GameObjects.Sprite; // The regular sprite of the tile

    position: Phaser.Geom.Point;
    gridLocation: Phaser.Geom.Point;

    hintValue: number = 0;
    isRevealed: boolean = false;
    isMarked: boolean = false;

    // Whether this tile has a mine or not
    get containsMine(): boolean { return this.hintValue == -1; }

    constructor(scene: Phaser.Scene, group: Phaser.GameObjects.Group, position: Phaser.Geom.Point, gridLocationX: number, gridLocationY: number)
    {
        this.scene = scene;
        this.group = group;

        // Create new sprite based on the spritesheet
        this.sprite = scene.add.sprite(0, 0, 'minesweeper_sheet');
        this.sprite.setOrigin(0, 0);

        // Show the hidden tile sprite from the spritesheet
        this.sprite.setFrame(TileFrames.Hidden);

        // Set the position based on the grid location
        this.sprite.setPosition(position.x, position.y);
        this.position = position;

        this.group.add(this.sprite);

        this.gridLocation = new Phaser.Geom.Point(gridLocationX, gridLocationY);
    }

    setMine()
    {
        this.hintValue = -1;

        // Debug Code (Shows where the mines are)
        //this.sprite.setFrame(TileFrames.Selected);
    }

    select()
    {
        this.sprite.setFrame(TileFrames.Selected);
    }

    unselect()
    {
        this.sprite.setFrame(TileFrames.Hidden);
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
            this.hintSprite = this.createSprite(TileFrames.Mine);
            
        }
        else if (this.hintValue > 0)
        {
            this.hintSprite = this.createSprite(this.hintValue - 1);
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

        this.group.add(newSprite);

        return newSprite;
    }

    reset()
    {
        // Unmark the tile
        if (this.isMarked) this.unMark();
        
        // Destroy hint number or mine if it was shown to the player
        this.hintValue = 0;
        if (this.hintSprite != undefined) this.hintSprite.destroy();

        // Make the tile hidden again
        this.isRevealed = false;
        this.sprite.setFrame(TileFrames.Hidden);
    }
}