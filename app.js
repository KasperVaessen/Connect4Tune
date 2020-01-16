// var createError = require('http-errors');
var express = require('express');
var http = require("http");
var websocket = require("ws");
var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

var indexRouter = require('./routes/index');
//var Game = require('./game')

var gameStatus = require("./stattracker")

var port = process.argv[2];
var app = express();

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
    gamesCompleted: gameStatus.gamesCompleted
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

// var currentGame = new Game(gameStatus.gamesInitialized++);
// var connectionID = 0; //each websocket receives a unique ID



server.listen(port)
