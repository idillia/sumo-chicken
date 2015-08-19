var host = exports.host;

exports.checkForOrSetHost = function(socketID) {
  if(!host) host = socketID;
  console.log("Hearts game host: "+socketID);
};

var gameHearts = {};

var Heart = function() {
  return {
    positionX: undefined,
    positionY: undefined,
    velocityX: 0,
    velocityY: 0
  };
};

