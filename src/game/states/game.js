var gameState = {

    text: undefined,
    map: undefined,
    layer: undefined,
    cursors: undefined,
    player: undefined,
    enemies: undefined,
    pathfinding: undefined,
    emitter: undefined,
    enemyEmitter: undefined,
    bullets: undefined,
    fireRate: undefined,
    nextFire: undefined,
    resizeTO: 0,

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
        this.player = game.add.sprite(56, 56, 'player', 1);
        this.player.animations.add('left', [8,9], 10, true);
        this.player.animations.add('right', [1,2], 10, true);
        this.player.animations.add('up', [11,12,13], 10, true);
        this.player.animations.add('down', [4,5,6], 10, true);
        this.player.facing = 'right';

        game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.setSize(10, 10, 2, 2);
        this.player.anchor.setTo(0.5,0.5);

        //console.log(this.player.health);
        this.player.events.onKilled.add(this.playerKilled, this);

        game.camera.follow(this.player);

        this.cursors = game.input.keyboard.createCursorKeys();

        //  Our bullet group
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(30, 'bullet', 0, false);
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);

        this.fireRate = 100;
        this.nextFire = 0;

        //  Register the space key.
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        //  Stop the following key from propagating up to the browser
        game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

        this.emitter = game.add.emitter(this.player.position.x, this.player.position.y, 200);
        this.emitter.makeParticles('redgibs', [0,1,2,3,4], 200, true, true);
        this.emitter.minParticleSpeed.setTo(-200, -300);
        this.emitter.maxParticleSpeed.setTo(200, -400);
        this.emitter.gravity = 150;
        this.emitter.bounce.setTo(0.5, 0.5);
        this.emitter.angularDrag = 30;

        //  Enemies
        this.enemies = [];

        for (var e = 0; e < gameData.settings.enemies.spawnpoints.length; e++) {
            var spawnpoint = gameData.settings.enemies.spawnpoints[e];
            var enemy = game.add.sprite(spawnpoint.x, spawnpoint.y, 'enemy', 1);
            enemy.animations.add('left', [8,9], 10, true);
            enemy.animations.add('right', [1,2], 10, true);
            enemy.animations.add('up', [11,12,13], 10, true);
            enemy.animations.add('down', [4,5,6], 10, true);

            game.physics.enable(enemy, Phaser.Physics.ARCADE);
            enemy.body.setSize(10, 10, 2, 2);
            enemy.anchor.setTo(0.5,0.5);

            enemy.pathfinding = {
                path: [],
                path_step: -1,
                searching: false,
                walkspeed: gameData.settings.enemies.walkspeed,
                damage: gameData.settings.enemies.damage,
                spawnpoint: {x: spawnpoint.x, y: spawnpoint.y}
            };

            this.enemies.push(enemy);
        }

        this.enemyEmitter = game.add.emitter(this.player.position.x, this.player.position.y, 200);
        this.enemyEmitter.makeParticles('greengibs', [0,1,2,3,4], 200, true, true);
        this.enemyEmitter.minParticleSpeed.setTo(-200, -300);
        this.enemyEmitter.maxParticleSpeed.setTo(200, -400);
        this.enemyEmitter.gravity = 150;
        this.enemyEmitter.bounce.setTo(0.5, 0.5);
        this.enemyEmitter.angularDrag = 30;

        var text = this.text = game.add.text(game.camera.width / 2, (game.camera.height / 2) - 48, "Arrows to move");
        text.anchor.setTo(0.5,0.5);
        text.font = fontName;
        text.fontSize = 32;
        text.fill = '#80649b';
        text.align = 'center';
        text.fixedToCamera = true;

        this.usedCursors = false;
        this.usedSpacebar = false;
        this.hiddenCursorInfo = false;
        this.hiddenSpacebarInfo = false;

        this.playerCanBeRevived = false;

    },

    update: function () {

        game.physics.arcade.collide(this.emitter, this.layer);
        game.physics.arcade.collide(this.enemyEmitter, this.layer);
        game.physics.arcade.collide(this.bullets, this.layer, this.bulletsMapCollide, null, this);

        game.physics.arcade.collide(this.player, this.layer);

        this.player.body.velocity.set(0);

        if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -100;
            this.player.play('left');
            this.player.facing = 'left';
            this.usedCursors = true;
        } else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = 100;
            this.player.play('right');
            this.player.facing = 'right';
            this.usedCursors = true;
        } else if (this.cursors.up.isDown) {
            this.player.body.velocity.y = -100;
            this.player.play('up');
            this.player.facing = 'up';
            this.usedCursors = true;
        } else if (this.cursors.down.isDown) {
            this.player.body.velocity.y = 100;
            this.player.play('down');
            this.player.facing = 'down';
            this.usedCursors = true;
        } else {
            this.player.animations.stop();
        }

        if (this.usedCursors && !this.hiddenCursorInfo) {
            this.text.visible = false;
            this.hiddenCursorInfo = true;
            game.time.events.add(Phaser.Timer.SECOND * 8, function () {
                this.text.fill = '#f7a506';
                this.text.text = 'Space to shoot';
                this.text.visible = true;
                this.hiddenSpacebarInfo = false;
            }, this);
        }

        if (this.player.alive && this.spaceKey.isDown) {
            if (game.time.now > this.nextFire && this.bullets.countDead() > 0)
            {
                this.nextFire = game.time.now + this.fireRate;

                var bullet = this.bullets.getFirstExists(false);

                bullet.reset(this.player.x, this.player.y);

                switch (this.player.facing) {
                    case 'left':
                        bullet.angle = 180;
                        game.physics.arcade.moveToXY(bullet, 0, this.player.y, 1000);
                        break;
                    case 'right':
                        bullet.angle = 0;
                        game.physics.arcade.moveToXY(bullet, 2048, this.player.y, 1000);
                        break;
                    case 'up':
                        bullet.angle = -90;
                        game.physics.arcade.moveToXY(bullet, this.player.x, 0, 1000);
                        break;
                    case 'down':
                        bullet.angle = 90;
                        game.physics.arcade.moveToXY(bullet, this.player.x, 2048, 1000);
                        break;
                }
                fx.play('bullet');

                this.usedSpacebar = true;
            }
        }

        if (!this.player.alive && this.spaceKey.isDown && this.playerCanBeRevived) {
            this.revivePlayer();
        }

        if (this.usedSpacebar && !this.hiddenSpacebarInfo) {
            this.text.visible = false;
            this.hiddenSpacebarInfo = true;
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

            for (var b = 0; b < this.enemies.length; b++) {
                var enemyB = this.enemies[b];
                if (enemy !== enemyB) {
                    game.physics.arcade.collide(enemy, enemyB, this.enemyEnemyCollide, null, this);
                }
            }

            game.physics.arcade.collide(enemy, this.bullets, this.enemyBulletCollide, null, this);
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

    enemyPlayerCollide: function (enemy, player) {
        player.health -= enemy.pathfinding.damage;
        console.log(player.health);
        if (player.health < 0) {
            player.kill();
        }
    },

    enemyBulletCollide: function (enemy, bullet) {
        bullet.kill();
        // todo: needs refactoring
        enemy.health -= 0.1;
        if (enemy.health <= 0.2) {
            this.enemyEmitter.x = enemy.x;
            this.enemyEmitter.y = enemy.y;
            this.enemyEmitter.start(true, 8000, null, 40);
            game.camera.shake(0.05, 500);
            fxtwo.play('splat');
            enemy.health = 1;
            enemy.body.x = enemy.pathfinding.spawnpoint.x;
            enemy.body.y = enemy.pathfinding.spawnpoint.y;
            enemy.pathfinding.path = [];
            enemy.pathfinding.path_step = -1;
            enemy.body.velocity.x = 0;
            enemy.body.velocity.y = 0;
        }
    },

    enemyEnemyCollide: function (enemyA, enemyB) {
        // todo: needs refactoring
        this.enemyEmitter.x = enemyA.x;
        this.enemyEmitter.y = enemyA.y;
        this.enemyEmitter.start(true, 8000, null, 40);
        game.camera.shake(0.05, 500);
        fxtwo.play('splat');
        enemyA.health = 1;
        enemyA.body.x = enemyA.pathfinding.spawnpoint.x;
        enemyA.body.y = enemyA.pathfinding.spawnpoint.y;
        enemyA.pathfinding.path = [];
        enemyA.pathfinding.path_step = -1;
        enemyA.body.velocity.x = 0;
        enemyA.body.velocity.y = 0;
    },

    playerKilled: function () {

        this.emitter.x = this.player.x;
        this.emitter.y = this.player.y;
        this.emitter.start(true, 8000, null, 40);
        game.camera.shake(0.05, 500);
        fx.play('player_explosion');

        this.text.fill = '#6b9541';
        this.text.text = 'Game over';
        this.text.visible = true;

        game.time.events.add(Phaser.Timer.SECOND * 3, function () {
            this.playerCanBeRevived = true;
        }, this);

        game.time.events.add(Phaser.Timer.SECOND * 8, function () {
            this.text.fill = '#80649b';
            this.text.text = 'Space to play again';
            // if it is visible then it is
        }, this);

    },

    revivePlayer: function () {
        this.player.body.x = 56;
        this.player.body.y = 56;
        this.player.revive(1);
        this.text.visible = false;
        this.playerCanBeRevived = false;
    },

    bulletsMapCollide: function (bullet, map) {
        bullet.kill();
    },

    resize: function () {

        var that = this;
        clearTimeout(this.resizeTO);
        this.resizeTO = setTimeout(function () {
            that.text.cameraOffset.x = game.camera.width / 2;
            that.text.cameraOffset.y = (game.camera.height / 2) - 48;
            that.layer.resize(game.camera.width, game.camera.height);
        }, 1000);

    },

    shutdown: function () {

        this.text = undefined;
        this.map = undefined;
        this.layer = undefined;
        this.cursors = undefined;
        this.player = undefined;
        this.enemies = undefined;
        this.emitter = undefined;
        this.enemyEmitter = undefined;
        this.bullets = undefined;
        this.fireRate = undefined;
        this.nextFire = undefined;

    }

};
