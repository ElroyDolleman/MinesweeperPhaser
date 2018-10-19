const RESTART_BUTTON_SIZE = 100;
const BOT_BUTTON_SIZE = 100;
const BUTTON_WIDTH = 250;
const BUTTON_HEIGHT = 80;
const BUTTON_TEXTURE_POS_Y = 150;
const BUTTON_MARGIN = 4;

class Menu
{
    resetButtonSprite: Phaser.GameObjects.Sprite;
    rectangle: Phaser.GameObjects.Rectangle;

    botButton: Phaser.GameObjects.Sprite;
    botIsOn: boolean = false;

    mainMenuButtons: Array<Phaser.GameObjects.Sprite>;

    constructor(scene: Phaser.Scene)
    {
        this.resetButtonSprite = scene.add.sprite(SCREEN_WIDTH - BOARD_POSITION_X - RESTART_BUTTON_SIZE, SCREEN_HEIGHT - RESTART_BUTTON_SIZE - BOARD_POSITION_X, 'ui');
        this.resetButtonSprite.frame = new Phaser.Textures.Frame(this.resetButtonSprite.texture, 'resetbutton', 0, 0, 50, RESTART_BUTTON_SIZE, RESTART_BUTTON_SIZE);
        this.resetButtonSprite.setSizeToFrame(this.resetButtonSprite.frame);
        this.resetButtonSprite.setOrigin(0, 0);
        this.resetButtonSprite.setVisible(false);

        this.botButton = scene.add.sprite(BOARD_POSITION_X, this.resetButtonSprite.getTopLeft().y, 'bot_button');
        this.botButton.setOrigin(0, 0);

        // Button event for the bot toggle
        this.botButton.setInteractive();
        var ref = this;
        this.botButton.on('pointerup', function() {
            ref.botIsOn = !ref.botIsOn;

            if (ref.botIsOn)
            {
                ref.botButton.setFrame(1);
            }
            else ref.botButton.setFrame(0);
        });

        this.rectangle = scene.add.rectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 0, 0.5)
        this.rectangle.setOrigin(0, 0);

        this.mainMenuButtons = [];
    }

    createNewButton(scene: Phaser.Scene, callback: Function)
    {
        var index = this.mainMenuButtons.length;
        var button = scene.add.sprite(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 'ui');

        button.frame = new Phaser.Textures.Frame(button.texture, 'button' + index, 0, 0, BUTTON_TEXTURE_POS_Y + index * BUTTON_HEIGHT, BUTTON_WIDTH, BUTTON_HEIGHT);
        button.setSizeToFrame(button.frame);
        button.setOrigin(0.5, 0.5);

        button.setInteractive();
        button.on('pointerdown', callback);

        this.mainMenuButtons.push(button);
    }

    updateButtonLayout()
    {
        let length = this.mainMenuButtons.length;
        let buttonHeight = (BUTTON_HEIGHT + BUTTON_MARGIN * 2);
        let totalHeight = length * buttonHeight;

        for (var i = 0; i < length; i++)
        {
            this.mainMenuButtons[i].setPosition(SCREEN_WIDTH / 2, BUTTON_HEIGHT / 2 + ( (SCREEN_HEIGHT / 2) - (totalHeight / 2) + (i * buttonHeight)) );
        }
    }

    addRestartEvent(callback: Function)
    {
        this.resetButtonSprite.setInteractive();
        this.resetButtonSprite.on('pointerdown', callback);
    }

    showMainMenu()
    {
        this.rectangle.setVisible(true);
        this.botButton.setVisible(true);

        this.mainMenuButtons.forEach(button => {
            button.setVisible(true);
        });

        this.resetButtonSprite.setVisible(false);
    }

    hideMainMenu()
    {
        this.rectangle.setVisible(false);
        this.botButton.setVisible(false);

        this.mainMenuButtons.forEach(button => {
            button.setVisible(false);
        });

        this.resetButtonSprite.setVisible(true);
    }
}