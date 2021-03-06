var loadState = {

    nFontChecks: 0,

    preload: function () {

        var versionSuffix = '?v11';

        // do preloading
        game.load.json('gameData', 'assets/data/game.json');
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        //game.load.image('square', 'assets/sprites/square.png');
        game.load.audio('sfx', ['assets/audio/audiosprite_mixdown.mp3', 'assets/audio/audiosprite_mixdown.ogg']);
        game.load.audio('sfxtwo', ['assets/audio/audiospritetwo_mixdown.mp3' + versionSuffix, 'assets/audio/audiospritetwo_mixdown.ogg' + versionSuffix]);
        game.load.audio('eerie', ['assets/audio/eerie-mixdown.mp3', 'assets/audio/eerie-mixdown.ogg']);
        game.load.tilemap('map', 'assets/tilemaps/csv/graves.csv', null, Phaser.Tilemap.CSV);
        game.load.image('tiles', 'assets/tilemaps/tiles/tiles_16.png');
        game.load.image('levelflat', 'assets/sprites/level.png');
        game.load.spritesheet('player', 'assets/sprites/eddy.png', 16, 16);
        game.load.spritesheet('redgibs', 'assets/sprites/redgibs.png', 6, 6);
        game.load.image('bullet', 'assets/sprites/bullet.png');
        game.load.image('ammobar-outer', 'assets/sprites/ammobar-outer.png');
        game.load.image('ammobar-inner', 'assets/sprites/ammobar-inner.png');
        game.load.image('ammo-kit', 'assets/sprites/ammo-kit.png');
        game.load.image('healthbar-outer', 'assets/sprites/healthbar-outer.png');
        game.load.image('healthbar-inner', 'assets/sprites/healthbar-inner.png');
        game.load.image('health-kit', 'assets/sprites/health-kit.png');
        game.load.spritesheet('enemy', 'assets/sprites/salad.png', 16, 16);
        game.load.spritesheet('greengibs', 'assets/sprites/greengibs.png', 6, 6);
        game.load.image('startscreen', 'assets/sprites/startscreen.png');
        game.load.image('dpad', 'assets/controls/dpad.png');
        game.load.image('touchsegment', 'assets/controls/touchsegment.png');
        game.load.image('touch', 'assets/controls/touch.png')

    },

    create: function () {

        fx = game.add.audio('sfx');
        fx.allowMultiple = true;
        fx.addMarker('player_explosion', 1, 6);
        fx.addMarker('enemy_explosion', 8, 1);
        fx.addMarker('bullet', 10, 0.5);
        fx.addMarker('silence', 12, 1);

        fxtwo = game.add.audio('sfxtwo');
        fxtwo.allowMultiple = true;
        fxtwo.addMarker('splat', 1, 1);
        fxtwo.addMarker('healthup', 3, 1);
        fxtwo.addMarker('silencetwo', 5, 1);
        // ...


        gameData = game.cache.getJSON('gameData');
        //console.log(gameData);
        this.checkFontLoaded();

    },

    checkFontLoaded: function () {

        loadState.nFontChecks++;
        if ((fontName == googleFontName) || (loadState.nFontChecks >= 6)) {
            game.state.start('splash');
        } else {
            setTimeout(loadState.checkFontLoaded, 500);
        }

    }

};
