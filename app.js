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
   * inform the client about its assigned player type
   */
  con.send(playerType == "A" ? messages.S_PLAYER_A : messages.S_PLAYER_B);


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
  // con.on("message", function incoming(message) {
  //   let oMsg = JSON.parse(message);

  //   let gameObj = websockets[con.id];
  //   let isPlayerA = gameObj.playerA == con ? true : false;

  //   if (isPlayerA) {
  //     /*
  //      * player A cannot do a lot, just send the target word;
  //      * if player B is already available, send message to B
  //      */
  //     if (oMsg.type == messages.T_TARGET_WORD) {
  //       gameObj.setWord(oMsg.data);

  //       if (gameObj.hasTwoConnectedPlayers()) {
  //         gameObj.playerB.send(message);
  //       }
  //     }
  //   } else {
  //     /*
  //      * player B can make a guess;
  //      * this guess is forwarded to A
  //      */
  //     if (oMsg.type == messages.T_MAKE_A_GUESS) {
  //       gameObj.playerA.send(message);
  //       gameObj.setStatus("CHAR GUESSED");
  //     }

  //     /*
  //      * player B can state who won/lost
  //      */
  //     if (oMsg.type == messages.T_GAME_WON_BY) {
  //       gameObj.setStatus(oMsg.data);
  //       //game was won by somebody, update statistics
  //       gameStatus.gamesCompleted++;
  //     }
  //   }
  // });

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

      if (gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
        gameObj.setStatus("ABORTED");

        /*
         * determine whose connection remains open;
         * close it
         */
        try {
          gameObj.playerA.close();
          gameObj.playerA = null;
        } catch (e) {
          console.log("Player A closing: " + e);
        }

        try {
          gameObj.playerB.close();
          gameObj.playerB = null;
        } catch (e) {
          console.log("Player B closing: " + e);
        }
      }
    }
  });
});

server.listen(port)
