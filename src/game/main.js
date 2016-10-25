var game;

var gameData;

var fontName = 'monospace';
var googleFontName = 'UnifrakturMaguntia';

var serifFontName = 'serif';
var googleSerifFontName = 'IM Fell DW Pica SC';

var music;

var fx;
var fxtwo;
window.PhaserGlobal = { disableWebAudio: true };

// http://www.colourlovers.com/palette/164182/Octobers_End
// ash: b9b68e, pumpkin: c98c30, orange: c95b30, purple: 80649b, dark-grey: 3e3d41

var colors = {normalBG: '#131822', normalStroke: '#31453e'};
var tints = {normalBG: 0x131822, normalStroke: 0x31453e};

WebFontConfig = {
    active: function() { fontName = googleFontName; serifFontName = googleSerifFontName; },
    google: {
        families: [googleFontName, googleSerifFontName]
    }
};

// for an obscure roman score
function romanize (num) {
  var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},roman = '',i;
  for ( i in lookup ) {
    while ( num >= lookup[i] ) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

window.onload = function() {

    game = new Phaser.Game("100%", "100%", Phaser.CANVAS, '');

    game.state.add('boot', bootState);
    game.state.add('load', loadState);
    game.state.add('splash', splashState);
    game.state.add('menu', menuState);
    game.state.add('game', gameState);

    game.state.start('boot');

};
