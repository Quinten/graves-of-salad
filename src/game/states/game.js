var gameState = {

    text: undefined,
    map: undefined,
    layer: undefined,
    levelflat: undefined,
    cursors: undefined,
    player: undefined,
    enemies: undefined,
    pathfinding: undefined,
    emitter: undefined,
    enemyEmitter: undefined,
    bullets: undefined,
    fireRate: undefined,
    nextFire: undefined,
    ammo: undefined,
    resizeTO: 0,
    healthbarInner: undefined,
    healthbarOuter: undefined,
    healthkit: undefined,
    ammobarInner: undefined,
    ammobarOuter: undefined,
    ammokit: undefined,
    score: undefined,
    scoreText: undefined,

    create: function () {

        game.time.advancedTiming = true; // for debuging the fps

        //  Because we're loading CSV map data we have to specify the tile size here or we can't render it
        this.map = game.add.tilemap('map', 16, 16);

        //  Now add in the tileset
        //this.map.addTilesetImage('tiles');

        //  Create our layer
        this.layer = this.map.createLayer(0);
        //this.layer.renderSettings = {"enableScrollDelta":false,"overdrawRatio":0.2,"copyCanvas":null};
        this.layer.visible = false;

        //  Resize the world
        this.layer.resizeWorld();

        //  This isn't totally accurate, but it'll do for now
        this.map.setCollisionBetween(54, 83);

        // flattended map
        this.levelflat = game.add.image(0, 0, 'levelflat');

        //  Un-comment this on to see the collision tiles
        //this.layer.debug = true;

        //  Pathfinding
        var walkableTiles = [];
        for (var t = -1; t < 54; t++) {
            walkableTiles.push(t);
        }
        var tile_dimensions = new Phaser.Point(this.map.tileWidth, this.map.tileHeight);
        this.pathfinding = this.game.plugins.add(Pathfinding, this.map.layers[0].data, walkableTiles, tile_dimensions);

        var randomIndex = Math.floor(Math.random() * gameData.settings.healthkit.spawnpoints.length);
        var healthkitSpawnpoint = gameData.settings.healthkit.spawnpoints[randomIndex];
        this.healthkit = game.add.sprite(((healthkitSpawnpoint.x * 16) + 8), ((healthkitSpawnpoint.y * 16) + 8), 'health-kit');
        game.physics.enable(this.healthkit, Phaser.Physics.ARCADE);
        this.healthkit.body.setSize(10, 10, 2, 2);
        this.healthkit.anchor.setTo(0.5,0.5);

        randomIndex = Math.floor(Math.random() * gameData.settings.ammokit.spawnpoints.length);
        var ammokitSpawnpoint = gameData.settings.ammokit.spawnpoints[randomIndex];
        this.ammokit = game.add.sprite(((ammokitSpawnpoint.x * 16) + 8), ((ammokitSpawnpoint.y * 16) + 8), 'ammo-kit');
        game.physics.enable(this.ammokit, Phaser.Physics.ARCADE);
        this.ammokit.body.setSize(10, 10, 2, 2);
        this.ammokit.anchor.setTo(0.5,0.5);

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

        game.touchControl = this.game.plugins.add(Phaser.Plugin.TouchControl);
        game.touchControl.settings.singleDirection = true;
        game.touchControl.inputEnable();

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
        this.ammo = 1;

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
        //for (var e = 0; e < 1; e++) {
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

        //game.camera.follow(this.enemies[0]);

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

        this.healthbarOuter = game.add.sprite(20, 20, 'healthbar-outer');
        this.healthbarOuter.fixedToCamera = true;
        this.healthbarInner = game.add.sprite(24, 24, 'healthbar-inner');
        this.healthbarInner.fixedToCamera = true;
        this.healthbarInner.anchor.setTo(0,0);

        this.ammobarOuter = game.add.sprite(20, 20, 'ammobar-outer');
        this.ammobarOuter.fixedToCamera = true;
        this.ammobarOuter.anchor.setTo(1,0);
        this.ammobarOuter.cameraOffset.x = game.camera.width - 20;
        this.ammobarInner = game.add.sprite(24, 24, 'ammobar-inner');
        this.ammobarInner.fixedToCamera = true;
        this.ammobarInner.anchor.setTo(1,0);
        this.ammobarInner.cameraOffset.x = game.camera.width - 24;

        this.score = 0;

        text = this.scoreText = game.add.text(20, game.camera.height - 10, romanize(this.score));
        text.anchor.setTo(0, 1);
        text.font = serifFontName;
        text.fontSize = 24;
        text.fill = '#6b9541';
        text.align = 'left';
        text.fixedToCamera = true;

    },

    /*
    render: function () {
        function renderGroup(member) {
            game.debug.body(member);
        }
        this.bullets.forEachAlive(renderGroup, this);
    },
    */

    update: function () {

        game.physics.arcade.collide(this.emitter, this.layer);
        game.physics.arcade.collide(this.enemyEmitter, this.layer);
        game.physics.arcade.collide(this.bullets, this.layer, this.bulletsMapCollide, null, this);

        game.physics.arcade.collide(this.player, this.layer);

        this.player.body.velocity.set(0);

        if (this.cursors.left.isDown || game.touchControl.cursors.left || pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
            this.player.body.velocity.x = -100;
            this.player.play('left');
            this.player.facing = 'left';
            this.usedCursors = true;
        } else if (this.cursors.right.isDown || game.touchControl.cursors.right || pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
            this.player.body.velocity.x = 100;
            this.player.play('right');
            this.player.facing = 'right';
            this.usedCursors = true;
        } else if (this.cursors.up.isDown || game.touchControl.cursors.up || pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_UP) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.1) {
            this.player.body.velocity.y = -100;
            this.player.play('up');
            this.player.facing = 'up';
            this.usedCursors = true;
        } else if (this.cursors.down.isDown || game.touchControl.cursors.down || pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1) {
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

        if (this.player.alive && (this.ammo > 0) && (this.spaceKey.isDown || game.touchControl.cursors.space || pad1.justPressed(Phaser.Gamepad.XBOX360_A))) {
            if (game.time.now > this.nextFire && this.bullets.countDead() > 0)
            {
                this.nextFire = game.time.now + this.fireRate;

                var bullet = this.bullets.getFirstExists(false);

                bullet.reset(this.player.x, this.player.y);

                switch (this.player.facing) {
                    case 'left':
                        bullet.angle = 180;
                        bullet.body.setSize(36,12,0,0);
                        game.physics.arcade.moveToXY(bullet, 0, this.player.y, 1000);
                        break;
                    case 'right':
                        bullet.angle = 0;
                        bullet.body.setSize(36,12,0,0);
                        game.physics.arcade.moveToXY(bullet, 2048, this.player.y, 1000);
                        break;
                    case 'up':
                        bullet.angle = -90;
                        bullet.body.setSize(12,36,12,-12);
                        game.physics.arcade.moveToXY(bullet, this.player.x, 0, 1000);
                        break;
                    case 'down':
                        bullet.angle = 90;
                        bullet.body.setSize(12,36,12,-12);
                        game.physics.arcade.moveToXY(bullet, this.player.x, 2048, 1000);
                        break;
                }
                fx.play('bullet');

                this.ammo -= 0.01;
                this.ammobarInner.width = Math.max(0, this.ammo) * 152;

                this.usedSpacebar = true;
            }
        }

        if (!this.player.alive && (this.spaceKey.isDown || game.input.pointer1.isDown || pad1.justPressed(Phaser.Gamepad.XBOX360_A)) && this.playerCanBeRevived) {
            this.revivePlayer();
        }

        if (this.player.alive && this.player.health < 0.5) {
            this.healthkit.visible = true;
            game.physics.arcade.overlap(this.player, this.healthkit, this.playerHealthkitOverlap, null, this);
        } else {
            this.healthkit.visible = false;
        }

        if (this.player.alive && this.ammo < 0.5) {
            this.ammokit.visible = true;
            game.physics.arcade.overlap(this.player, this.ammokit, this.playerAmmokitOverlap, null, this);
        } else {
            this.ammokit.visible = false;
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

            // collide is cool effect, but also makes them more easy to kill
            game.physics.arcade.overlap(enemy, this.bullets, this.enemyBulletCollide, null, this);
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
        this.healthbarInner.width = Math.max(0, this.player.health) * 152;
        //console.log(player.health);
        if (player.health < 0) {
            player.kill();
        }
    },

    enemyBulletCollide: function (enemy, bullet) {

        bullet.kill();

        enemy.health -= 0.1;
        if (enemy.health <= 0.2) {
            this.enemyKilled(enemy);
            this.score += 1;
            this.scoreText.text = romanize(this.score);
        }

        enemy.pathfinding.path = [];
        enemy.pathfinding.path_step = -1;
        enemy.body.velocity.x = 0;
        enemy.body.velocity.y = 0;

    },

    enemyEnemyCollide: function (enemyA, enemyB) {

        this.enemyKilled(enemyA);

    },

    enemyKilled: function (enemy) {

        this.enemyEmitter.x = enemy.x;
        this.enemyEmitter.y = enemy.y;
        this.enemyEmitter.start(true, 8000, null, 40);
        game.camera.shake(0.05, 500);
        fxtwo.play('splat');
        enemy.health = 1;
        var randomIndex = Math.floor(Math.random() * gameData.settings.enemies.spawnpoints.length);
        var spawnpoint = gameData.settings.enemies.spawnpoints[randomIndex];
        enemy.pathfinding.spawnpoint.x = spawnpoint.x;
        enemy.pathfinding.spawnpoint.y = spawnpoint.y;
        enemy.body.x = enemy.pathfinding.spawnpoint.x;
        enemy.body.y = enemy.pathfinding.spawnpoint.y;
        enemy.pathfinding.path = [];
        enemy.pathfinding.path_step = -1;
        enemy.body.velocity.x = 0;
        enemy.body.velocity.y = 0;

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
        this.healthbarInner.width = 152;
        this.ammo = 1;
        this.ammobarInner.width = 152;
        this.text.visible = false;
        this.playerCanBeRevived = false;
        this.score = 0;
        this.scoreText.text = romanize(this.score);
    },

    playerHealthkitOverlap: function (player, healthkit) {
        //console.log('overlap');
        var randomIndex = Math.floor(Math.random() * gameData.settings.healthkit.spawnpoints.length);
        var healthkitSpawnpoint = gameData.settings.healthkit.spawnpoints[randomIndex];
        this.healthkit.body.x = healthkitSpawnpoint.x * 16;
        this.healthkit.body.y = healthkitSpawnpoint.y * 16;
        this.healthkit.visible = false;
        this.player.health = 1;
        this.healthbarInner.width = 152;
        fxtwo.play('healthup');
    },

    playerAmmokitOverlap: function (player, ammokit) {
        //console.log('overlap');
        var randomIndex = Math.floor(Math.random() * gameData.settings.ammokit.spawnpoints.length);
        var ammokitSpawnpoint = gameData.settings.ammokit.spawnpoints[randomIndex];
        this.ammokit.body.x = ammokitSpawnpoint.x * 16;
        this.ammokit.body.y = ammokitSpawnpoint.y * 16;
        this.ammokit.visible = false;
        this.ammo = 1;
        this.ammobarInner.width = 152;
        fxtwo.play('healthup');
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
            that.ammobarOuter.cameraOffset.x = game.camera.width - 20;
            that.ammobarInner.cameraOffset.x = game.camera.width - 24;
            that.scoreText.cameraOffset.y = game.camera.height - 10;
        }, 1000);

    },

    shutdown: function () {

        this.text = undefined;
        this.map = undefined;
        this.layer = undefined;
        this.levelflat = undefined;
        this.cursors = undefined;
        this.player = undefined;
        this.enemies = undefined;
        this.emitter = undefined;
        this.enemyEmitter = undefined;
        this.bullets = undefined;
        this.fireRate = undefined;
        this.nextFire = undefined;
        this.ammo = undefined;
        this.healthbarInner = undefined;
        this.healthbarOuter = undefined;
        this.healthkit = undefined;
        this.ammobarInner = undefined;
        this.ammobarOuter = undefined;
        this.ammokit = undefined;
        this.score = undefined;
        this.scoreText = undefined;

    },

    render: function () {

        //game.debug.text('FPS: ' + game.time.fps, 32, 32, "#ffffff");
        //game.debug.spriteInfo(this.player, 32, 64);
        //game.debug.spriteInfo(this.enemy, 496, 64);
    }

};
