var startGame = function() {
  playerUsername = document.getElementById('username').value;
  var radios = document.getElementsByName('game-mode');

  for (var i = 0; i < radios.length; i++)  {
    if (radios[i].checked) {
      // NEW GLOBAL VAR
      selectedMode = radios[i].value;
      break;
    }
  }

  var main = document.getElementById('main');
  main.parentNode.removeChild(main);

  game = new Phaser.Game(window.innerWidth, 
                             window.innerHeight, 
                             Phaser.AUTO, 
                             '', 
                             { preload: preload, 
                               create: create, 
                               update: update}
                            );

  return false;
};