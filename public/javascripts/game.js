$(document).ready(function(){
    var color = "red";
    var turns = 0;
    var audio = document.getElementById("tokensound"); 
    audio.controls = false;
    var turnText = document.getElementById("turnText"); 
    var playerID = "yellow";
    var canPlace = false;
    changeText();

    var tokenArrayBegin  = document.getElementsByClassName("tokenplace");
    for (var i = 0; i < tokenArrayBegin.length; i++){
        tokenArrayBegin[i].id = i;
    }

    function changeText(){
        turnText.style.color = color;
        if(canPlace){
            turnText.innerHTML = "Your turn!";
        } else {
            turnText.innerHTML = "Opponents turn!";
        }
    }

    var tokenArray = new Array(7);
    for(var x = 0; x < 7; x++){
        tokenArray[x] = new Array(6);   
    }
    console.log(tokenArray[0][0]);

    $('.tokenplace').click(function(){
        console.log("Clicked on: " + this.id);
        console.log(this);

        
        addToColumn(this, this.id);
    })

    function getColumn(id){
        return id % 7;
    }

    function changeColor(){
        if (color == "red"){
            color = "yellow";
        } else {
            color = "red";
        }
    }

    function addToColumn(element, id){
        var column = getColumn(id);
       
        for (var i = 5; i >= 0; i--){
            if(tokenArray[column][i] == null){
                console.log("Column is: " + column + ". Index is: " + i);
                placeToken(column, i);
                tokenArray[column][i] = color;
                playTokenSound();
                console.log(tokenArray[column]);
                checkWin(column, i);
                canPlace = !canPlace;
                changeText();
                turns++;
                break;  
            }
            if (i == 0){
                if(turns > 41){
                    alert("game has ended nobody won");
                }
                alert("row is full");
            }
        }
    }

    function checkWin(column, index){
        var horzOffset1 = inLine(-1, 0, column, index);
        var horzOffset2 = inLine(1, 0, column, index);
        var vertOffset1 = inLine(0, 1, column, index);
        var vertOffset2 = inLine(0, -1, column, index);
        var cross1Offset1 = inLine(1, 1, column, index);
        var cross1Offset2 = inLine(-1, -1, column, index);
        var cross2Offset1 = inLine(1, -1, column, index);
        var cross2Offset2 = inLine(-1, 1, column, index);
        if(checkOffset(horzOffset1, horzOffset2) || checkOffset(vertOffset1, vertOffset2) || checkOffset(cross1Offset1, cross1Offset2) || checkOffset(cross2Offset1, cross2Offset2)){
            console.log(tokenArray)
            alert(color + " has won");
        }
        changeColor();
    }

    function checkOffset(offset1, offset2){
        if (offset1 + offset2 >= 1){
            console.log("Offset 1: " + offset1 + ". Offset2: " + offset2);
        }
        if (offset1 + offset2 >= 3){
            return true;
        }
        return false;
    }

    function inLine(xOffset, yOffset, column, index){console
        if (!((Math.abs(xOffset) == 1 || Math.abs(xOffset) == 0) && (Math.abs(yOffset) == 1) || (Math.abs(yOffset) == 0))){
            console.log("line offset bigger than 1");
            return 0;
        }
        var totalInline = 0;
        var column = column;
        var index = index;
        while(((column + xOffset >= 0) && (column + xOffset < 7)) && ((index + yOffset >= 0) && (index + yOffset < 6))){
            column = column + xOffset;
            index = index + yOffset;
            console.log("CHECK: " + column, index + " Offset: " + xOffset, yOffset);
            if (getTokenColor(column, index) == color){
                console.log("MATCH: " + column + " " + index);
                totalInline++;
            } else {
                break;
            }
        }
        return totalInline;
    }

    function placeToken(column, index){
        var id = (7 * index) + column;
        var tokenArrayBegin  = document.getElementsByClassName("tokenplace");
        for (var i = 0; i < tokenArrayBegin.length; i++){
            if (tokenArrayBegin[i].id == id){
                tokenArrayBegin[i].style.backgroundColor = color;
            }
        }
        return
    }

    function getTokenColor(column, index){
        var id = (7 * index) + column;
        var tokenArrayBegin  = document.getElementsByClassName("tokenplace");
        for (var i = 0; i < tokenArrayBegin.length; i++){
            if (tokenArrayBegin[i].id == id){
                return tokenArrayBegin[i].style.backgroundColor;
            }
        }
    }

    function playTokenSound(){
        if (audio.paused) {
            audio.play();
        }else{
            audio.currentTime = 0
        }
    }
    
    var socket = new WebSocket("ws://localhost:3000");
  });
