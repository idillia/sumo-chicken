var Lobby = require('./Lobby.js').Lobby;

// All lobbies
var gameModes = ['Classic', 'Kill Count'];
var lobbies = {};
for (var i = 0; i < gameModes.length; i++) {
  lobbies[gameModes[i]] = [];
}
var maxLobbySize = 5;

// Hash takes socketID and gives lobbyID
var playerLobbies = {}; // to improve lookup when finding lobby that a player is in

/* Helper function: gets the next lobby with an empty space 
 * returns a tuple of lobbyID and position in the lobby
 */
var getNextLobby = function(mode) {
  mode = mode || 'Classic';
  var lobby;
  for (var i = lobbies[mode].length - 1; i >= 0; i--) {
    if (!lobbies[mode][i].full()) {
      lobby = lobbies[mode][i];
    }
  }

  if (!lobby) {
    lobby = new Lobby(maxLobbySize);
    lobbies[mode].push(lobby);
  }

  return lobby;
};

// Given a new socketID, inserts the new player into a lobby
var addToLobby = function(socketID, mode) {
  var openLobby = getNextLobby(mode);
  openLobby.addPlayer(socketID);
  playerLobbies[socketID] = openLobby;
};

// Given a socketID from a disconnected player, removes the player from a lobby
var removeFromLobby = function(socketID) {
  var playerLobby = playerLobbies[socketID];
  playerLobby.removePlayer(socketID);

  delete playerLobbies[socketID];
};

// Gets a player's lobby information given a player's socketID
var getLobbyById = function(socketID) {
  return playerLobbies[socketID];
};

module.exports = {
  addToLobby : addToLobby,
  removeFromLobby : removeFromLobby,
  getLobbyById : getLobbyById
};
