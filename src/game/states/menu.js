var menuState = {

    menuGroup: undefined,
    switched: false,
    textstart: undefined,
    blinkCount: 0,

    create: function () {

        this.menuGroup = game.add.group();
        this.menuGroup.x = game.world.centerX;
        this.menuGroup.y = game.world.centerY;

        var textsprite = this.menuGroup.add(this.createText(0, -142, 'Graves of salad', '#6b9541', 42));
        this.textstart = this.menuGroup.add(this.createText(0, 142, 'press space', colors.normalStroke, 20));

        var startimage = this.menuGroup.add(game.add.sprite(0, 0, 'startscreen'));
        startimage.anchor.setTo(0.5);

        //  Register the key.
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        //  Stop the following key from propagating up to the browser
        game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

        this.switched = false;

        //if (game.input.gamepad.supported && game.input.gamepad.active && pad1.connected) {
            //console.log('gamepad yes');
        //}

    },

    update: function () {

        if ((pad1.justPressed(Phaser.Gamepad.XBOX360_A) || this.spaceKey.downDuration(1000)) && !this.switched) {
            //console.log('switched');
            this.switched = true;
            game.state.start('game');
        }

        this.blinkCount++;
        if (this.blinkCount > 15) {
            this.blinkCount = 0;
            this.textstart.visible = !this.textstart.visible;
        }
    },

    resize: function () {

        this.menuGroup.x = game.world.centerX;
        this.menuGroup.y = game.world.centerY;

    },

    shutdown: function () {

        this.menuGroup = undefined;
        this.textstart = undefined;

    },

    createText: function (x, y, text, color, size) {

        var textSprite = game.add.text(x, y, text);
        textSprite.anchor.setTo(0.5);
        textSprite.font = fontName;
        textSprite.fontSize = size;
        textSprite.fill = color;
        textSprite.align = 'center';

        return textSprite;

    }
};
