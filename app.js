// var createError = require('http-errors');
var express = require('express');
var http = require("http");
var websocket = require("ws");
var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

var indexRouter = require('./routes/index');
var Game = require('./game')
var messages = require('./public/javascripts/messages')

var gameStatus = require("./stattracker")

var port = process.argv[2];
var app = express();

var players = 0;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/game", indexRouter);

app.get("/", (req, res) => {
  res.render("splash.ejs", {
    gamesCompleted: gameStatus.gamesCompleted,
    recentTime: gameStatus.recentTime,
    onlinePlayers: players
  });
});

var server = http.createServer(app);
const wss = new websocket.Server({ server });

var websockets = {};

setInterval(function() {
  for (let i in websockets) {
    if (Object.prototype.hasOwnProperty.call(websockets,i)) {
      let gameObj = websockets[i];
      //if the gameObj has a final status, the game is complete/aborted
      if (gameObj.finalStatus != null) {
        delete websockets[i];
      }
    }
  }
}, 50000);

var currentGame = new Game(gameStatus.gamesInitialized++);
var connectionID = 0; //each websocket receives a unique ID



wss.on('connection', function connection(ws) {

  /*
   * two-player game: every two players are added to the same game
   */
  players++
  let con = ws;
  let conid = connectionID++;
  let playerType = currentGame.addPlayer(con);
  websockets[conid] = currentGame;

  console.log(
    "Player %s placed in game %s as %s",
    conid,
    currentGame.id,
    playerType
  );

  /*
   * once we have two players, there is no way back;
   * a new game object is created;
   * if a player now leaves, the game is aborted (player is not preplaced)
   */
  if (currentGame.hasTwoConnectedPlayers()) {
    currentGame = new Game(gameStatus.gamesInitialized++);
  }

  // /*
  //  * message coming in from a player:
  //  *  1. determine the game object
  //  *  2. determine the opposing player OP
  //  *  3. send the message to OP
  //  */
  con.on("message", function incoming(message) {
    let oMsg = JSON.parse(message);
    let gameObj = websockets[conid];
    let isRed = gameObj.red == con ? true : false;
    let isYellow = gameObj.yellow == con ? true : false;

    if(gameObj.hasTwoConnectedPlayers()) {
      if(isRed && gameObj.color == 'red') {
        gameObj.addToColumn(oMsg)
        let field = gameObj.tokenArray;
        console.log(field);
        gameObj.red.send(JSON.stringify(field))
        gameObj.yellow.send(JSON.stringify(field))
      }

      if(isYellow && gameObj.color == 'yellow') {
        gameObj.addToColumn(oMsg)
        let field = gameObj.tokenArray;
        console.log(field);
        gameObj.red.send(JSON.stringify(field))
        gameObj.yellow.send(JSON.stringify(field))
      }

      if(gameObj.hasEnded()) {
        gameStatus.gamesCompleted++
        gameObj.red.send(gameObj.gameState)
        gameObj.yellow.send(gameObj.gameState)
      }
    }
  }) 
 

  con.on("close", function(code) {
    /*
     * code 1001 means almost always closing initiated by the client;
     * source: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
     */
    console.log(conid + " disconnected ...");
    players--;

    if (code == "1001") {
      /*
       * if possible, abort the game; if not, the game is already completed
       */
      let gameObj = websockets[conid];

      gameObj.setStatus("ABORTED");

      /*
        * determine whose connection remains open;
        * close it
        */
      try {
        gameObj.red.close();
        gameObj.red = null;
      } catch (e) {
        console.log("Red closing: " + e);
      }

      try {
        gameObj.yellow.close();
        gameObj.yellow = null;
      } catch (e) {
        console.log("Yellow closing: " + e);
      }
    }
  });
});

server.listen(port);
