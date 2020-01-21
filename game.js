var game = function(gameID) {
    this.red = null;
    this.yellow = null;
    this.id = gameID;
    this.color = 'red';
    this.turns = 0;
    this.gameState = "0 JOINT"; //"RED" means A won, "YELLOW" means B won, "ABORTED" means the game was aborted
    this.tokenArray = [
      ['white','white','white','white','white','white'],
      ['white','white','white','white','white','white'],
      ['white','white','white','white','white','white'],
      ['white','white','white','white','white','white'],
      ['white','white','white','white','white','white'],
      ['white','white','white','white','white','white'],
      ['white','white','white','white','white','white'],
    ]
  };


game.prototype.changeColor = function(){
  if (this.color == "red"){
      this.color = "yellow";
  } else {
      this.color = "red";
  }
}

game.prototype.getColumn = function(id){
  return id % 7;
}

game.prototype.addToColumn = function(id) {
  var column = game.prototype.getColumn(id);
 
  for (var i = 5; i >= 0; i--){
      if(this.tokenArray[column][i] == 'white'){
          this.tokenArray[column][i] = this.color;
          //console.log(this.tokenArray)
          this.checkWin(column, i);
          this.changeColor();
          this.turns++;
          break;  
      }
      if (i == 0){
          if(this.turns > 41){
            this.setStatus('TIE')
          }
      }
  }
}

game.prototype.checkWin = function(column, index){
  var horzOffset1 = this.inLine(-1, 0, column, index);
  var horzOffset2 = this.inLine(1, 0, column, index);
  var vertOffset1 = this.inLine(0, 1, column, index);
  var vertOffset2 = this.inLine(0, -1, column, index);
  var cross1Offset1 = this.inLine(1, 1, column, index);
  var cross1Offset2 = this.inLine(-1, -1, column, index);
  var cross2Offset1 = this.inLine(1, -1, column, index);
  var cross2Offset2 = this.inLine(-1, 1, column, index);
  if(this.checkOffset(horzOffset1, horzOffset2) || this.checkOffset(vertOffset1, vertOffset2) || this.checkOffset(cross1Offset1, cross1Offset2) || this.checkOffset(cross2Offset1, cross2Offset2)){
      //console.log(this.tokenArray)
      this.setStatus(this.color.toUpperCase() + " HAS WON");
  }
}

game.prototype.checkOffset = function(offset1, offset2){
  if (offset1 + offset2 >= 1){
      console.log("Offset 1: " + offset1 + ". Offset2: " + offset2);
  }
  if (offset1 + offset2 >= 3){
      return true;
  }
  return false;
}

game.prototype.inLine = function(xOffset, yOffset, column, index){
  //console.log(this.tokenArray)
  if (!((Math.abs(xOffset) == 1 || Math.abs(xOffset) == 0) && (Math.abs(yOffset) == 1) || (Math.abs(yOffset) == 0))){
      //console.log("line offset bigger than 1");
      return 0;
  }
  var totalInline = 0;
  var column = column;
  var index = index;
  while(((column + xOffset >= 0) && (column + xOffset < 7)) && ((index + yOffset >= 0) && (index + yOffset < 6))){
      column = column + xOffset;
      index = index + yOffset;
      //console.log("CHECK: " + column, index + " Offset: " + xOffset, yOffset);
      if (this.tokenArray[column][index] == this.color){
          //console.log("MATCH: " + column + " " + index);
          totalInline++;
      } else {
          break;
      }
  }
  return totalInline;
}

game.prototype.setStatus = function(w) {
  console.assert(
    typeof w == "string",
    "%s: Expecting a string, got a %s",
    arguments.callee.name,
    typeof w
  );

  this.gameState = w;
  console.log("[STATUS] %s", this.gameState);
};

game.prototype.hasEnded = function() {
  return this.gameState.includes('HAS WON') || this.gameState.includes('TIE')
}


game.prototype.hasTwoConnectedPlayers = function() {
  return this.gameState == "2 JOINT";
};

game.prototype.addPlayer = function(p) {
  console.assert(
    p instanceof Object,
    "%s: Expecting an object (WebSocket), got a %s",
    arguments.callee.name,
    typeof p
  );

  /*
   * revise the game state
   */

  if(this.gameState == '1 JOINT') {
    this.setStatus("2 JOINT")
  }
  else {
    this.setStatus("1 JOINT")
  }

  if (this.red == null) {
    this.red = p;
    return "RED";
  } else {
    this.yellow = p;
    return "YELLOW";
  }
};

module.exports = game;