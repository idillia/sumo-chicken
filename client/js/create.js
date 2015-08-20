var lastData = null;
var scoreList = [];
var heartData = null;
var isHeart = false;

// platforms are [x, y, spriteKey, scale] and ordered by height
var platformLocations = [[0, -175, 'platform', 2],
                         [800, -175, 'platform', 2], [-800, -175, 'platform', 2],
                         [1100, -50, 'cloud', 1], [-1100, -50, 'cloud', 1],
                         [-450, -25, 'platform', 2], [450, -25, 'platform', 2],
                         [0, -75, 'cloud', 1],
                         [0, 100, 'platform', 2],
                         [800, 150, 'platform', 2], [-800, 150, 'platform', 2],
                         [200, 200, 'cloud', 1], [-200, 200, 'cloud', 1],
                         [0, 300, 'cloud', 1],
                         [1100, 375, 'cloud', 1], [-1100, 375, 'cloud', 1],
                         [800, 375, 'cloud', 1], [-800, 375, 'cloud', 1],
                         [400, 350, 'platform', 2], [-400, 350, 'platform', 2]];


var music;
var sfx;
var audioSprite;

var Explosion = function() {
  var played = false;
  this.play = function() {
    if (!played) {
      played = true;
      sfx.play('explosion');
    }
  };
  this.stop = function() {
    played = false;
    sfx.stop('explosion');
  };
};

var explosion = new Explosion();

var hearts,
    score = 0,
    scoreText,
    scoreHeart = 0,
    scoreTextHeart;

var create = function(){

  socket = io.connect({query: 'mode=' + selectedMode});

  socket = io.connect();
  socket.on('syncHeart', function(gameHearts){
    // console.log('create.js on client: syncHeart fired, gameHearts: ');
    // console.log(gameHearts);
    createHearts(gameHearts);
  });
  createHearts();

  socket.emit('username', {username: playerUsername});

  //  Phaser will automatically pause if the browser tab the game is in loses focus. Disabled this below.
  //  NOTE: Uncomment the following line for testing if you want to have two games playing in two browsers.
  this.stage.disableVisibilityChange = true;

  game.world.setBounds(-2000, -2000, 4000, 4000 );
  game.time.desiredFps = 45;

  game.camera.x = -game.camera.width / 2;
  game.camera.y = -game.camera.height / 2;

  game.physics.startSystem(Phaser.Physics.ARCADE);

  // Adds the forest and lava background
  drawEnvironment();

  // Create instructions
  viewInstructions();

  // Create the initial player
  player = new Player(game, 0, 0, false);
  game.add.existing(player);
  player.addUsernameLabel(playerUsername);
  lava.bringToTop(); // player falls behind lava

  // Instantiate object to hold other chickens
  otherChickens = {};



  // Respawns the player
  socket.on('newLocation', function(data){
    player = new Player(game, data.x, data.y, false);
    game.add.existing(player);
    setCamera();
    player.addUsernameLabel(playerUsername);
    lava.bringToTop();
    explosion.stop();
    music.play();
  });

  // Syncs player to the server
  socket.on('sync', function(data){
    lastData = data;
  });

  // Create platforms
  createPlatforms();

  // Create button inputs
  jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  dashButton = game.input.keyboard.addKey(Phaser.Keyboard.C);

  dashButton.onDown.add(function() {
    player.dash();
  }, this);

  // Set the Camera to follow the player
  setCamera();

  cursors = game.input.keyboard.createCursorKeys();

  game.onPause.add(pauseGame, this);

  game.onResume.add(resumeGame, this);

  // Music
  music = game.add.audio('boden');
  music.play();

  // Sound Effects
  sfx = game.add.audio('explosion');
  sfx.addMarker('explosion', 1, 2.5);
  
  audioSprite = game.add.audio('audioSprite');
  audioSprite.addMarker('bump', 1, 1.0);
  audioSprite.addMarker('dash', 12, 4.2);
  audioSprite.addMarker('jump', 8, 0.5);
 
};


var pauseGame = function() {
  socket.emit('pause');
};

var resumeGame = function() {
  socket.emit('resume');
};

var upgradeChicken = function(chicken, score) {
  // put upgrading system here
  chicken.setLevel(score);
};

var syncExistingChicken = function(chicken, data) {

  if (data.username !== '') chicken.addUsernameLabel(data.username);
  if (!data.paused) {
    chicken.tint = 0xFFFFFF;
    chicken.body.moves = true;
    chicken.paused = false;
    chicken.x = data.positionX;
    chicken.y = data.positionY;
    chicken.body.velocity.x = data.velocityX;
    chicken.body.velocity.y = data.velocityY;
    if (chicken.score !== data.kills) {
      chicken.score = data.kills;
      chicken.setLevel(data.kills);
    }
  } else {
    chicken.tint = 0x707070;
    chicken.body.moves = false;
    chicken.paused = true;
  }
};

var addNewChicken = function(socketId, data) {
  newChicken = new Player(game, data.positionX, data.positionY, socketId);
  game.add.existing(newChicken);
  otherChickens[socketId] = newChicken;
  otherChickens[socketId].score = data.kills;
  upgradeChicken(otherChickens[socketId], data.kills);
  lava.bringToTop();
};

var drawEnvironment = function() {
  // draw a red colored rectangle to go below lava
  var graphics = game.add.graphics(0, 0);
  graphics.beginFill(0xDD2200, 1);
  graphics.drawRect(-2000,0, 4000, 4000);
  graphics.endFill();

  // add the forest background
  background = game.add.tileSprite(-2000, -400, 4000, 400, "background");
  background.scale.x = 2;
  background.scale.y = 2;

  // add the lava at the bottom
  lava = game.add.tileSprite(-2000, 365,4000,180,"lava");
  lava.scale.x = 1;
};

var viewInstructions = function() {
  var margin = 10;
  bmpText = game.add.bitmapText(-game.camera.width / 2 + margin,
                                -game.camera.height / 2 + margin,
                                'carrier_command',
                                'Move: arrow keys\n\nJump: SPACEBAR\n\nDash: C', 17);

  bmpText.fixedToCamera = true;
  bmpText.cameraOffset.setTo(10, 10);

  game.time.events.add(6000, function() {
    game.add.tween(bmpText).to({y: -170}, 1500, Phaser.Easing.Linear.None, true);
    game.add.tween(bmpText).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true);
  }, this);
};

var createPlatforms = function() {
  platforms = game.add.group();
  platforms.enableBody = true;

  platformLocations.forEach(function(platformCoords){
    var platform = platforms.create(platformCoords[0], platformCoords[1], platformCoords[2]);
    platform.scale.x = platformCoords[3];
    platform.scale.y = platformCoords[3];
    platform.anchor.setTo(0.5, 0.5);
    platform.body.immovable = true;
  });
};

var setCamera = function(){
  var cameraMargin = 250;
  game.camera.follow(player);
  game.camera.deadzone = new Phaser.Rectangle(cameraMargin,
                                              cameraMargin,
                                              game.camera.width - cameraMargin * 2,
                                              game.camera.height - cameraMargin * 2);
  game.camera.focusOnXY(0, 0);
};

var createHearts = function(gameHearts){

  hearts = game.add.group();
  hearts.enableBody = true;

  // socket.on('syncHeart', function(gameHearts){
    heartData = gameHearts; 
    for(var key in heartData){
      // data is an obj, ex {x:220, y:123, id:3}
      data = heartData[key];

      var heart = hearts.create(data.positionX, data.positionY, 'heart');
      // console.log('client, creat.js, heart created, ');
      // console.log(heart);
      heart.scale.x = 0.5;
      heart.scale.y = 0.5;
      heart.id = data.id;
      heart.body.immovable = true; 
    }
  // });

  socket.on('heartKill', function(data){
    // hearts.filter(function(child){return child.id === 8}).first.kill();
    var heartID = data.heart;
    // TODO: update other player score
    hearts.filter(function(child){return child.id === heartID;}).first.kill();

  });
  scoreTextHeart = game.add.bitmapText(0, 0, 'carrier_command', 'collected: 0', 30);

  scoreTextHeart.fixedToCamera = true;
  scoreTextHeart.cameraOffset.setTo(10, 110);

   game.time.events.add(6750, function() {
    game.add.tween(scoreTextHeart.cameraOffset).to({x:10, y:10}, 1500, Phaser.Easing.Linear.None, true);
  }, this);




  // //  Here we'll create 12 of them evenly spaced apart
  //   for (var i = 0; i < 15; i++)
  //   {
  //       //  Create a star inside of the 'hearts' group
  //       var heart = hearts.create(, , 'heart');

  //       //  Let gravity do its thing
  //       // heart.body.gravity.y = 6;

  //       //  This just gives each star a slightly random bounce value
  //       // heart.body.bounce.y = 0.7 + Math.random() * 0.2;
};
  



