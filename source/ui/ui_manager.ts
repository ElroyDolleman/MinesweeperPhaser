class UIManager
{
    hud: HUD;
    menu: Menu;
    endScreen: EndScreen;

    constructor(scene: Phaser.Scene)
    {
        this.endScreen = new EndScreen(scene);

        this.menu = new Menu(scene);

        this.hud = new HUD(scene, BOARD_POSITION_X, BOARD_POSITION_X, BOARD_WIDTH);
    }
}