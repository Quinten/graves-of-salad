var map;
var layer;
var cursors;
var player;

var gameState = {

    text: undefined,

    create: function () {

        //var text = gameState.text = game.add.text(game.world.centerX, game.world.centerY, "The game will start\nNOW!");
        //text.anchor.setTo(0.5);
        //text.font = fontName;
        //text.fontSize = 20;
        //text.fill = colors.normalStroke;
        //text.align = 'center';

    //  Because we're loading CSV map data we have to specify the tile size here or we can't render it
    map = game.add.tilemap('map', 16, 16);

    //  Now add in the tileset
    map.addTilesetImage('tiles');

    //  Create our layer
    layer = map.createLayer(0);

    //  Resize the world
    layer.resizeWorld();

    //  This isn't totally accurate, but it'll do for now
    map.setCollisionBetween(54, 83);

    //  Un-comment this on to see the collision tiles
    //layer.debug = true;

    //  Player
    player = game.add.sprite(48, 48, 'player', 1);
    player.animations.add('left', [8,9], 10, true);
    player.animations.add('right', [1,2], 10, true);
    player.animations.add('up', [11,12,13], 10, true);
    player.animations.add('down', [4,5,6], 10, true);

    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.setSize(10, 14, 2, 1);

    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();

    var help = game.add.text(16, 16, 'Arrows to move', { font: '14px Arial', fill: '#ffffff' });
    help.fixedToCamera = true;

    },

    update: function () {

    game.physics.arcade.collide(player, layer);

    player.body.velocity.set(0);

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -100;
        player.play('left');
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 100;
        player.play('right');
    }
    else if (cursors.up.isDown)
    {
        player.body.velocity.y = -100;
        player.play('up');
    }
    else if (cursors.down.isDown)
    {
        player.body.velocity.y = 100;
        player.play('down');
    }
    else
    {
        player.animations.stop();
    }

    },

    resize: function () {

        //var text = gameState.text;
        //text.x = game.world.centerX;
        //text.y = game.world.centerY;

    },

    shutdown: function () {

        gameState.text = undefined;

    }

};
