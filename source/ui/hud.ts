const DIGIT_AMOUNT = 3;
const MINUS_SIGN_FRAME = 11;

class HUD
{
    position: Phaser.Geom.Point;

    minesDigitsSprites: Array<Phaser.GameObjects.Sprite>;
    timeDigitsSprites: Array<Phaser.GameObjects.Sprite>;

    constructor(scene: Phaser.Scene, posX: number, posY: number, width: number)
    {
        this.position = new Phaser.Geom.Point(posX, posY);

        // Place the mines counter on the left
        this.minesDigitsSprites = this.createSpriteDigits(scene, this.position);
        this.updateMinesAmount(0);

        // Place the timer on the right
        var rightPos = new Phaser.Geom.Point(posX + width - TIMER_FONT_WIDTH * DIGIT_AMOUNT, posY);
        this.timeDigitsSprites = this.createSpriteDigits(scene, rightPos);
        this.updateTime(0);
    }

    // Creates an array of sprites as digits
    createSpriteDigits(scene: Phaser.Scene, pos: Phaser.Geom.Point, digitAmoount: number = DIGIT_AMOUNT): Array<Phaser.GameObjects.Sprite>
    {
        var digitSprites: Array<Phaser.GameObjects.Sprite> = [];

        // Add each digit as a sprite from right to left
        for (var i = digitAmoount - 1; i >= 0; i--)
        {
            var len = digitSprites.push(scene.add.sprite(pos.x + i * TIMER_FONT_WIDTH, pos.y, 'timer_font_sheet'));
            digitSprites[len-1].setOrigin(0, 0);
        }

        return digitSprites;
    }

    updateMinesAmount(marks: number)
    {
        this.updateSpriteDigits(this.minesDigitsSprites, marks);
    }

    updateTime(time: number)
    {
        this.updateSpriteDigits(this.timeDigitsSprites, time);
    }

    // Update the digit sprites so that it matches a number
    updateSpriteDigits(digitSprites: Array<Phaser.GameObjects.Sprite>, num: number)
    {
        // Check if it's a minus number and calculate where the minus sign should be placed
        var minusSign = -1;
        if (num < 0)
        {
            minusSign = num.toString().length - 1;
            num *= -1;
        }

        // Keep track of the highest digit
        var highestDigit = 0;

        for (var i = digitSprites.length - 1; i >= 0; i--)
        {
            // Ignore the calculation if a minus sign needs to be placed
            if (i == minusSign)
            {
                digitSprites[i].setFrame(MINUS_SIGN_FRAME);
                continue;
            }

            // Calculate the current digit
            var powOfTen = Math.pow(10, i);
            var digit = Math.floor(num / powOfTen);

            // Show the 'off' digit instead of a 0 when the number doesn't have enough digits (so that 99 doesn't show as 099)
            var frame = digit == 0 && highestDigit == 0 && i != 0 ? 0 : digit + 1;

            // Show the correct digit
            digitSprites[i].setFrame(frame);

            // Remove the digit from the number so it won't mess up the calculation
            num -= digit * powOfTen;

            // Update the highest digit
            if (digit > highestDigit) highestDigit = digit;
        }
    }
}