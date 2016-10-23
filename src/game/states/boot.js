var bootState = {

    create: function () {

        // do settings
        game.stage.backgroundColor = colors.normalBG;

        game.scale.scaleMode = Phaser.ScaleManager.RESIZE;

        //game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        //game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
        //game.scale.pageAlignHorizontally = true;
        //game.scale.pageAlignVertically = true;

        game.stage.smoothed = false; // none pixelated effect
        game.input.mouse.capture = true;

        // go on to preloading
        game.state.start('load');
    }
};
