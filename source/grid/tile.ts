class Tile
{
    position: Phaser.Geom.Point;
    value: number = 0;
    isRevealed: boolean = false;
    isMarked: boolean = false;

    get containsMine(): boolean { return this.value == -1; }

    constructor()
    {
        
    }

    setMine()
    {
        this.value = -1;
    }

    reveal()
    {
        this.isRevealed = true;
    }

    mark()
    {
        this.isMarked = true;
    }
}