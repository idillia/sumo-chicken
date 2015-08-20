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

  var x = Math.floor(Math.random()*1500*neg());
  var y = Math.floor(Math.random()*(1500-400)+400);
  return {x:x, y:y};
};

var Heart = function() {
  var loc = randomLocationGenerator();
  return {
    positionX: loc.x,
    positionY: loc.y,
  };
};

var getHearts = function() {
  return gameHearts;
};

var gameStart = false;

var startingHearts = function(){
  for (var i=0; i<15; i++) {''
    var heart = Heart();
    // TODO: unique id
    heart.id = i;
    gameHearts[i] = heart;
  }
  gameStart = true;
};

module.exports = {
  getHearts: getHearts,
  startingHearts: startingHearts
};