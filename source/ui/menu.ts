const RESTART_BUTTON_SIZE = 100;

class Menu
{
    resetButtonSprite: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene)
    {
        this.resetButtonSprite = scene.add.sprite(SCREEN_WIDTH - BOARD_POSITION_X - RESTART_BUTTON_SIZE, SCREEN_HEIGHT - RESTART_BUTTON_SIZE - BOARD_POSITION_X, 'ui', 'test1');
        this.resetButtonSprite.frame = new Phaser.Textures.Frame(this.resetButtonSprite.texture, 'resetbutton', 0, 0, 50, RESTART_BUTTON_SIZE, RESTART_BUTTON_SIZE);
        this.resetButtonSprite.setOrigin(0, 0);
    }


}