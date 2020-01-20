

$(document).ready(function(){
    var audio = document.getElementById("tokensound"); 
    audio.controls = false;
    var turnText = document.getElementById("turnText"); 
    var tokenArrayBegin  = document.getElementsByClassName("tokenplace");
    
    for (var i = 0; i < tokenArrayBegin.length; i++){
        tokenArrayBegin[i].id = i;
    }

    function changeText(){
        if(turnText.innerHTML == "Red's turn"){
            turnText.style.color = 'yellow';
            turnText.innerHTML = "Yellow's turn";
        } 
        else {
            turnText.style.color = 'red';
            turnText.innerHTML = "Red's turn";
        }
    }

    $('.tokenplace').click(function(){
        console.log("Clicked on: " + this.id);
        console.log(this);
        socket.send(this.id)
        playTokenSound()
    })

    function renderField(tokenArray) {
        for (let i = 0; i < tokenArray.length; i++) {
            for (let j = 0; j < tokenArray[i].length; j++) {
                placeToken(i, j, tokenArray[i][j]);
            }
            
        }
        changeText()
    }

    function placeToken(column, index, color){
        var id = (7 * index) + column;
        var tokenArrayBegin  = document.getElementsByClassName("tokenplace");
        for (var i = 0; i < tokenArrayBegin.length; i++){
            if (tokenArrayBegin[i].id == id){
                tokenArrayBegin[i].style.backgroundColor = color;
            }
        }
        return
    }

    function playTokenSound(){
        if (audio.paused) {
            audio.play();
        }else{
            audio.currentTime = 0
        }
    }

    var socket = new WebSocket("ws://localhost:3000");
    socket.onmessage = function(event) {
        let incomingMsg = event.data;
        if(incomingMsg == 'START') {
            alert("You joined, you're yellow, red is now placing")
        }
        if(incomingMsg == 'JOINED') {
            alert("Someone joined, you're red, you can place")
        }
        if(incomingMsg.includes('HAS WON') || incomingMsg.includes('TIE')) {
            alert(incomingMsg)
            //socket.close()
        }
        else {
            let array = JSON.parse(incomingMsg)
            renderField(array)
        }
    }

    socket.onclose = function() {
        alert('game was closed')
    }

    
  });