const WIN_TEXT_WIDTH: number = 480;
const WIN_TEXT_HEIGHT: number = 50;
const WIN_TEXT_POSITION_Y: number = 108;

class WinScreen
{
    winTextSprite: Phaser.GameObjects.Sprite;
    rectangle: Phaser.GameObjects.Rectangle;

    get isVisible() { return this.winTextSprite.visible; }

    constructor(scene: Phaser.Scene)
    {
        this.rectangle = scene.add.rectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 0, 0.5)
        this.rectangle.setOrigin(0, 0);

        this.winTextSprite = scene.add.sprite(0, WIN_TEXT_POSITION_Y, 'ui');
        this.winTextSprite.frame = new Phaser.Textures.Frame(this.winTextSprite.texture, 'wintext', 0, 0, 0, WIN_TEXT_WIDTH, WIN_TEXT_HEIGHT);
        this.winTextSprite.setOrigin(0, 0);
    }

    setVisible(visible: boolean)
    {
        this.winTextSprite.setVisible(visible);
        this.rectangle.setVisible(visible);
    }
}