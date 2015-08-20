// gameHearts and gameStart are lobby-specific 
// refactor to be lobby specific
var gameHearts = {};
var gameStart = false;

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

var removeHeart = function(id){
  if(!gameHearts[id]) return null;
  delete gameHearts[id];
};


var gameStarted = function(){
  return gameStart;
};
var addHeart = function(x,y){

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
  gameStarted: gameStarted,
  removeHeart: removeHeart
};