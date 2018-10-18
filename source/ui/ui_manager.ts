class UIManager
{
    hud: HUD;
    winScreen: WinScreen;
    menu: Menu;

    constructor(scene: Phaser.Scene)
    {
        this.winScreen = new WinScreen(scene);
        this.winScreen.setVisible(false);

        this.menu = new Menu(scene);

        this.hud = new HUD(scene, BOARD_POSITION_X, BOARD_POSITION_X, BOARD_WIDTH);
    }
}