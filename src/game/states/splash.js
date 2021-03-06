var splashState = {

    text: undefined,

    create: function () {

        music = game.add.audio('eerie');
        music.loopFull();

        var text = splashState.text = game.add.text(game.world.centerX, game.world.centerY, "Once upon a night...");
        text.anchor.setTo(0.5);

        text.font = fontName;
        text.fontSize = 20;

        text.fill = colors.normalStroke;

        text.align = 'center';

        game.time.events.add(Phaser.Timer.SECOND * 3, function () {
            game.state.start('menu');
        }, this);

    },

    resize: function () {

        var text = splashState.text;
        text.x = game.world.centerX;
        text.y = game.world.centerY;

    },

    shutdown: function () {

        splashState.text = undefined;

    }

};
