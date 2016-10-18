var game;

var gameData;

var fontName = 'monospace';
var googleFontName = 'UnifrakturMaguntia';

var fx;
window.PhaserGlobal = { disableWebAudio: true };

// http://www.colourlovers.com/palette/164182/Octobers_End
// ash: b9b68e, pumpkin: c98c30, orange: c95b30, purple: 80649b, dark-grey: 3e3d41

var colors = {normalBG: '#3e3d41', normalStroke: '#b9b68e'};
var tints = {normalBG: 0x3e3d41, normalStroke: 0xb9b68e};

WebFontConfig = {
    active: function() { fontName = googleFontName; },
    google: {
        families: [googleFontName]
    }
};

window.onload = function() {

    game = new Phaser.Game("100%", "100%", Phaser.CANVAS, '');

    game.state.add('boot', bootState);
    game.state.add('load', loadState);
    game.state.add('splash', splashState);
    game.state.add('menu', menuState);
    game.state.add('game', gameState);

    game.state.start('boot');

};