var host = exports.host;

exports.checkForOrSetHost = function(socketID) {
  if(!host) host = socketID;
  console.log("Hearts game host: "+socketID);
};

var gameHearts = {};

var randomLocationGenerator = function(){
  // positionX -2000, 2000
  // positionY -2000, 2000
  var neg = function() {
    return Math.random() > 0.5 ? -1 : 1;
  };

  var x = Math.floor(Math.random()*1000*neg());
  var y = Math.floor(Math.random()*(300+400)-400);
  return {x:x, y:y};
};

var Heart = function(x,y) {
  return {
    positionX: x,
    positionY: y,
  };
};

var getHearts = function() {
  return gameHearts;
};

var gameStart = false;

var gameStarted = function(){
  return gameStart;
};

var startingHearts = function(){
  for (var i=0; i<25; i++) {
    var heart = Heart(i*80-1000, randomLocationGenerator().y);
    // TODO: unique id
    heart.id = i;
    gameHearts[i] = heart;
  }
  gameStart = true;
  console.log("startingHearts complete, gameStart: "+gameStart);
};

module.exports = {
  getHearts: getHearts,
  startingHearts: startingHearts,
  gameStarted: gameStarted
};