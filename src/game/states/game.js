var gameState = {

    map: undefined,
    layer: undefined,
    cursors: undefined,
    player: undefined,

    create: function () {

        //  Because we're loading CSV map data we have to specify the tile size here or we can't render it
        this.map = game.add.tilemap('map', 16, 16);

        //  Now add in the tileset
        this.map.addTilesetImage('tiles');

        //  Create our layer
        this.layer = this.map.createLayer(0);

        //  Resize the world
        this.layer.resizeWorld();

        //  This isn't totally accurate, but it'll do for now
        this.map.setCollisionBetween(54, 83);

        //  Un-comment this on to see the collision tiles
        //this.layer.debug = true;

        //  Player
        //this.player = game.add.sprite(48, 48, 'player', 1);
        this.player = game.add.sprite(48, 48, 'enemy', 1);
        this.player.animations.add('left', [8,9], 10, true);
        this.player.animations.add('right', [1,2], 10, true);
        this.player.animations.add('up', [11,12,13], 10, true);
        this.player.animations.add('down', [4,5,6], 10, true);

        game.physics.enable(this.player, Phaser.Physics.ARCADE);

        this.player.body.setSize(10, 10, 2, 2);

        game.camera.follow(this.player);

        this.cursors = game.input.keyboard.createCursorKeys();

    },

    update: function () {

        game.physics.arcade.collide(this.player, this.layer);

        this.player.body.velocity.set(0);

        if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -100;
            this.player.play('left');
        } else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = 100;
            this.player.play('right');
        } else if (this.cursors.up.isDown) {
            this.player.body.velocity.y = -100;
            this.player.play('up');
        } else if (this.cursors.down.isDown) {
            this.player.body.velocity.y = 100;
            this.player.play('down');
        } else {
            this.player.animations.stop();
        }

    },

    resize: function () {

    },

    shutdown: function () {

        this.map = undefined;
        this.layer = undefined;
        this.cursors = undefined;
        this.player = undefined;

    }

};
