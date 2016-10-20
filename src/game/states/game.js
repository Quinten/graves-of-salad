var gameState = {

    map: undefined,
    layer: undefined,
    cursors: undefined,
    player: undefined,
    enemies: undefined,
    pathfinding: undefined,
    emitter: undefined,

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

        //  Pathfinding
        var walkableTiles = [];
        for (var t = -1; t < 54; t++) {
            walkableTiles.push(t);
        }
        var tile_dimensions = new Phaser.Point(this.map.tileWidth, this.map.tileHeight);
        this.pathfinding = this.game.plugins.add(Pathfinding, this.map.layers[0].data, walkableTiles, tile_dimensions);

        //  Player
        this.player = game.add.sprite(48, 48, 'player', 1);
        this.player.animations.add('left', [8,9], 10, true);
        this.player.animations.add('right', [1,2], 10, true);
        this.player.animations.add('up', [11,12,13], 10, true);
        this.player.animations.add('down', [4,5,6], 10, true);

        game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.setSize(10, 10, 2, 2);

        game.camera.follow(this.player);

        this.cursors = game.input.keyboard.createCursorKeys();

        this.emitter = game.add.emitter(this.player.position.x, this.player.position.y, 200);
        this.emitter.makeParticles('redgibs', [0,1,2,3,4], 200, true, true);
        this.emitter.minParticleSpeed.setTo(-200, -300);
        this.emitter.maxParticleSpeed.setTo(200, -400);
        this.emitter.gravity = 150;
        this.emitter.bounce.setTo(0.5, 0.5);
        this.emitter.angularDrag = 30;

        //  Enemies
        this.enemies = [];

        var enemy = game.add.sprite(2000, 2000, 'enemy', 1);
        enemy.animations.add('left', [8,9], 10, true);
        enemy.animations.add('right', [1,2], 10, true);
        enemy.animations.add('up', [11,12,13], 10, true);
        enemy.animations.add('down', [4,5,6], 10, true);

        game.physics.enable(enemy, Phaser.Physics.ARCADE);
        enemy.body.setSize(10, 10, 2, 2);
        enemy.anchor.setTo(0.5,0.5);

        enemy.pathfinding = {path: [], path_step: -1, searching: false, walkspeed: gameData.settings.enemies.walkspeed};

        this.enemies.push(enemy);

    },

    update: function () {

        game.physics.arcade.collide(this.emitter, this.layer);

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

        for (var e = 0; e < this.enemies.length; e++) {
            var enemy = this.enemies[e];
            var next_position, velocity;
            if (enemy.pathfinding.path.length < 1) {
                game.physics.arcade.collide(enemy, this.layer, this.enemyMapCollide, null, this);
            }
            enemy.body.velocity.set(0);

            if (enemy.pathfinding.path.length > 0) {
                next_position = enemy.pathfinding.path[enemy.pathfinding.path_step];

                if (!this.enemy_reached_target_position(enemy, next_position)) {
                    velocity = new Phaser.Point(next_position.x - enemy.position.x, next_position.y - enemy.position.y);
                    velocity.normalize();
                    enemy.body.velocity.x = velocity.x * enemy.pathfinding.walkspeed;
                    enemy.body.velocity.y = velocity.y * enemy.pathfinding.walkspeed;
                } else {
                    enemy.position.x = next_position.x;
                    enemy.position.y = next_position.y;
                    if (enemy.pathfinding.path_step < enemy.pathfinding.path.length - 1) {
                        enemy.pathfinding.path_step += 1;
                    } else {
                        enemy.pathfinding.path = [];
                        enemy.pathfinding.path_step = -1;
                        enemy.body.velocity.x = 0;
                        enemy.body.velocity.y = 0;
                    }
                }

                if (enemy.body.velocity.x < 0) {
                    enemy.play('left');
                } else if (enemy.body.velocity.x > 0) {
                    enemy.play('right');
                } else if (enemy.body.velocity.y < 0) {
                    enemy.play('up');
                } else if (enemy.body.velocity.y > 0) {
                    enemy.play('down');
                } else {
                    enemy.animations.stop();
                }

            } else {

                if (Math.floor(enemy.body.x / 8) > Math.floor(this.player.body.x / 8)) {
                    enemy.body.velocity.x = -enemy.pathfinding.walkspeed;
                    enemy.play('left');
                } else if (Math.floor(enemy.body.x / 8) < Math.floor(this.player.body.x / 8)) {
                    enemy.body.velocity.x = enemy.pathfinding.walkspeed;
                    enemy.play('right');
                } else if (Math.floor(enemy.body.y / 8) > Math.floor(this.player.body.y / 8)) {
                    enemy.body.velocity.y = -enemy.pathfinding.walkspeed;
                    enemy.play('up');
                } else if (Math.floor(enemy.body.y / 8) < Math.floor(this.player.body.y / 8)) {
                    enemy.body.velocity.y = enemy.pathfinding.walkspeed;
                    enemy.play('down');
                } else {
                    enemy.animations.stop();
                }
            }

            game.physics.arcade.collide(enemy, this.player, this.enemyPlayerCollide, null, this);
        }

    },

    enemy_reached_target_position: function (enemy, position) {
        var distance;
        distance = Phaser.Point.distance(enemy.position, position);
        return distance < 1;
    },

    enemyMapCollide: function (enemy, map) {
        if (!enemy.pathfinding.searching && enemy.pathfinding.path.length < 1) {
            enemy.pathfinding.searching = true;
            var callBackContext = {move_through_path: function (path) {
                if (path !== null) {
                    enemy.pathfinding.path = path;
                    enemy.pathfinding.path_step = 0;
                } else {
                    enemy.pathfinding.path = [];
                }
                enemy.pathfinding.searching = false;
            }};
            this.pathfinding.find_path(enemy.position, this.player.position, callBackContext.move_through_path, callBackContext);
        }
    },

    enemyPlayerCollide: function () {
        this.emitter.x = this.player.x;
        this.emitter.y = this.player.y;
        this.emitter.start(true, 2000, null, 20);
    },

    resize: function () {

    },

    shutdown: function () {

        this.map = undefined;
        this.layer = undefined;
        this.cursors = undefined;
        this.player = undefined;
        this.enemies = undefined;
        this.emitter = undefined;

    }

};
