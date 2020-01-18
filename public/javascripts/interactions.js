
var socket = new WebSocket("ws://localhost:3000");

socket.onopen = function() {
    console.log('WebSocket Client Connected');
    ws.send('Hi this is web client.');
};
socket.onmessage = function(e) {
    console.log("Received: '" + e.data + "'");
}
/*
    * initialize all UI elements of the game:
    * - visible word board (i.e. place where the hidden/unhidden word is shown)
    * - status bar
    * - alphabet board
    *
    * the GameState object coordinates everything
    */

socket.onerror = function() {};
