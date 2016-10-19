var loadState = {

    nFontChecks: 0,

    preload: function () {

        // do preloading
        game.load.json('gameData', 'assets/data/game.json');
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        //game.load.image('square', 'assets/sprites/square.png');
        //game.load.audio('sfx', 'assets/sounds/fx_mixdown.mp3');
        game.load.tilemap('map', 'assets/tilemaps/csv/graves.csv', null, Phaser.Tilemap.CSV);
        game.load.image('tiles', 'assets/tilemaps/tiles/tiles_16.png');
        game.load.spritesheet('player', 'assets/sprites/eddy.png', 16, 16);
        game.load.spritesheet('enemy', 'assets/sprites/salad.png', 16, 16);
    },

    create: function () {

        //fx = game.add.audio('sfx');
        //fx.allowMultiple = true;
        //fx.addMarker('sound_name', 1, 0.5);
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
