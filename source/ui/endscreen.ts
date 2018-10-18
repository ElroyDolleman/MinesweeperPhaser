const WIN_TEXT_WIDTH: number = 480;
const WIN_TEXT_HEIGHT: number = 50;

const LOSE_TEXT_WIDTH: number = 284;
const LOSE_TEXT_HEIGHT: number = 50;

const END_TEXT_POSITION_Y: number = 132;

class EndScreen
{
    loseTextSprite: Phaser.GameObjects.Sprite;
    winTextSprite: Phaser.GameObjects.Sprite;
    rectangle: Phaser.GameObjects.Rectangle;

    get isVisible() { return this.rectangle.visible; }

    constructor(scene: Phaser.Scene)
    {
        this.rectangle = scene.add.rectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 0, 0.5)
        this.rectangle.setOrigin(0, 0);

        this.winTextSprite = scene.add.sprite(SCREEN_WIDTH / 2, END_TEXT_POSITION_Y, 'ui');
        this.winTextSprite.frame = new Phaser.Textures.Frame(this.winTextSprite.texture, 'wintext', 0, 0, 0, WIN_TEXT_WIDTH, WIN_TEXT_HEIGHT);
        this.winTextSprite.setSizeToFrame(this.winTextSprite.frame);
        this.winTextSprite.setOrigin(0.5, 0.5);

        this.loseTextSprite = scene.add.sprite(SCREEN_WIDTH / 2, END_TEXT_POSITION_Y, 'ui');
        this.loseTextSprite.frame = new Phaser.Textures.Frame(this.loseTextSprite.texture, 'wintext', 0, 100, 50, LOSE_TEXT_WIDTH, LOSE_TEXT_HEIGHT);
        this.loseTextSprite.setSizeToFrame(this.loseTextSprite.frame);
        this.loseTextSprite.setOrigin(0.5, 0.5);

        this.hideEndScreen();
    }

    showEndScreen(won: boolean)
    {
        // Show the correct text
        var textSprite = won ? this.winTextSprite : this.loseTextSprite;
        textSprite.setVisible(true);

        // Make the background rectangle visible
        this.rectangle.setVisible(true);
    }

    hideEndScreen()
    {
        this.winTextSprite.setVisible(false);
        this.loseTextSprite.setVisible(false);
        this.rectangle.setVisible(false);
    }
}