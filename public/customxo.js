var winCond = [[0,1,2],[3,4,5],[6,7,8],
               [0,3,6],[1,4,7],[2,5,8],
               [0,4,8],[2,4,6]];

var gameMain = ["0", "0", "0",
                "0", "0", "0",
                "0", "0", "0"]; 

var chars = ["01","02","03","04","05","06","07","08","09","10","11","12","13"];
function charsBtnGen1() {
 for (var i = 0; i < chars.length; i++) {
  
  document.getElementById("charSymbols1").innerHTML += '<button id="char1'+i+'" class="charBtn1" onclick="chrChoose1('+i+');"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/1134440/icon'+chars[i]+'.png" style="width: 25px"></button>';
  
  
  
 }
} 
function charsBtnGen2() {
  for (var i = 0; i < chars.length; i++) {
   
   document.getElementById("charSymbols2").innerHTML += '<button id="char2'+i+'" class="charBtn2" onclick="chrChoose2('+i+');"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/1134440/icon'+chars[i]+'.png" style="width: 25px"></button>';
   
   
   
  }
 }

function openMenu(open) {
 if (open) {
  document.getElementById('menu-nav').style.display = 'flex';
  document.getElementById('header').style.opacity = '0.6';
  document.getElementById('main-section').style.opacity = '0.6';
 } else {
  document.getElementById('menu-nav').style.display = 'none';
  document.getElementById('header').style.opacity = '';
  document.getElementById('main-section').style.opacity = '';
 }
}

var aiChar = 'O';
var plChar = 'X';
var aiScore = 0;
var plScore = 0;
var tieScore = 0;

var gameStarted = false;
// --- \/ \/ \/ Before Game Start \/ \/ \/ ---

// </> Player 1st or 2nd 
plFirst = true;
function pickTurn(first) {
 if (first) {
  document.getElementById("1st").className = "active1";
  document.getElementById("2nd").className = "";
  document.getElementById("1st-next").className = "active1";
  document.getElementById("2nd-next").className = "";
 }
 if (!first) 
 {
  document.getElementById("2nd").className = "active2";
  document.getElementById("1st").className = "";
  document.getElementById("2nd-next").className = "active2";
  document.getElementById("1st-next").className = "";
  plMoveDisable = true;
 }
 plFirst = first;
}

// </> Character Chooser
function chrChoose1(x) {
 for (var i = 0; i < chars.length; i++) {
  document.getElementById("char1"+i).className = "charBtn1";
 }
 document.getElementById("char1"+x).className += " active1";
 plChar = chars[x];
}
function chrChoose2(x) {
  for (var i = 0; i < chars.length; i++) {
   document.getElementById("char2"+i).className = "charBtn2";
  }
  document.getElementById("char2"+x).className += " active2";
  aiChar = chars[x];
 }

// </> Character Change


// </> Random Ai Char
function randChar() {
    if (aiChar === "O" || aiChar === plChar) {
        var randPl =  Math.floor(Math.random()*chars.length);
        aiChar = chars[randPl];
    }
 
  return;
 }

// </> Start Game
var round = 0;
function startGame() {
 gameStarted = true;
 plMoveDisable = false;
 document.getElementById('start-select').style.display = 'none';
 document.getElementById('header').style.opacity = '';
 document.getElementById('main-section').style.opacity = '';
 if (round === 0) {
  document.getElementById("aiTalk").innerHTML = '"Have Fun"';
  
 }
 round++;
 !function () {
  var randPl =  Math.floor(Math.random()*chars.length);
  if (plChar === "X") {plChar = chars[randPl];}
 }();
 randChar();
var pos = document.getElementsByClassName("pos");
for (var i = 0; i < 9; i++) {
    pos[i].innerHTML = '<div><span class="pos-span"><span id="transpChars'+i+'"><span style="display: flex;"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/1134440/icon'+plChar+'.png" style="width: 50px; margin: auto;"></span></span></span></div>';
}
   



}


// --- /\ /\ /\  Before Game Start /\ /\ /\ ---


// --- \/ \/ \/  After Game Start \/ \/ \/ ---
// </> Checks for Victory
function checkVictory(who) {
   var inx = [], i;
   for (i = 0; i < 9; i++) {
    if (gameMain[i] === who) {
     inx.push(i);     }   
   }
   for (var j = 0; j < 8; j++) {
    var win = winCond[j];
    if (inx.indexOf(win[0]) !== -1 && 
        inx.indexOf(win[1]) !== -1 && 
        inx.indexOf(win[2]) !== -1) {
     
     for (let k = 0; k < 3; k++) {
      setTimeout(function() {
       document.getElementById("div"+win[k]).className = "win";
      },350*(k+1));
     }
     
      gameStarted = false;
      
      if(who === aiChar)
      {
      aiScore++;
      document.getElementById("score-ai").innerHTML = aiScore;
      document.getElementById("aiTalk").innerHTML = "Player 2 WON";
      }
      if (who === plChar)
      {
        plScore++;
        document.getElementById("score-pl").innerHTML = plScore;
        document.getElementById("aiTalk").innerHTML = "Player 1 WON";
        
      }
      
      setTimeout(function() {restart("tie");},2000);
      return true;    
     }   
   }  
   if (gameMain.indexOf("0") === -1) {
    gameStarted = false;
    
    setTimeout(function() {
     for (let k = 0; k < 9; k++) {
       setTimeout(function() {
        document.getElementById("div"+[k]).innerHTML = "";
       },125*(k+1));
      }
    },500);
    
    setTimeout(function() {restart("tie");},2100);
    tieScore++;
    document.getElementById("score-tie").innerHTML = tieScore;
    return true;
   }      
 return false;  
}

// </> Restart Game
function restart(x) {
 for (var i = 0; i < 9; i++) {
  document.getElementById("pos"+i).innerHTML = '<a href="javascript:void('+i+');" onclick="playerMove('+i+');" class="pos"></a>';
 }
 gameMain = ["0", "0", "0",
             "0", "0", "0",
             "0", "0", "0"];
  startGame();
  disableRestart = false;
}

// </> Write a Move
function writeOnGame(pos, char) {
 gameMain[pos] = char;
 console.log("iside write game");
 document.getElementById("pos"+pos)
  .innerHTML = "<div  class='taken' id='div"+pos+"'><span style='display: flex;'><img src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/1134440/icon"+char+".png' style='width: 50px; margin: auto;'></span></div>";
}

// </> Ai Triger and Equal Value Ai Move Randomizer
function aiTurn() {
 var posArr = ai();
 var ran = Math.floor(Math.random() * posArr.length);
 writeOnGame(posArr[ran], aiChar);
 checkVictory(aiChar);
}

// </> Player Click
var plMoveDisable = false
function playerMove(pos) {
 if (gameStarted && !plMoveDisable) {
  plMoveDisable = true;
  writeOnGame(pos, plChar);
  var win = checkVictory(plChar);
  if (win) {return;}
  changeinnerhtml(plMoveDisable);
}
 else 
    {
    writeOnGame(pos, aiChar);
    var win = checkVictory(aiChar);
    if (win) {return;}
    plMoveDisable = false;
    changeinnerhtml(plMoveDisable);
    }

}

function changeinnerhtml(plMoveDisable){
    var pos = document.getElementsByClassName("pos");
    if(plMoveDisable)
    {
        
        for (var i = 0; i < 9; i++) {
            pos[i].innerHTML = '<div><span class="pos-span"><span id="transpChars'+i+'"><span style="display: flex;"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/1134440/icon'+aiChar+'.png" style="width: 50px; margin: auto;"></span></span></span></div>';
        }
    }
    else
    {
        
        for (var i = 0; i < 9; i++) {
            pos[i].innerHTML = '<div><span class="pos-span"><span id="transpChars'+i+'"><span style="display: flex;"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/1134440/icon'+plChar+'.png" style="width: 50px; margin: auto;"></span></span></span></div>';
        }
    }





}

/// my code player 2 turn 

var aiMoveDisable = false
function aiplayerMove(pos) {
 if (gameStarted && !aiMoveDisable) {
  aiMoveDisable = true;
  console.log(" i m before write on game");
  writeOnGame(pos, aiChar);
  var win = checkVictory(aiChar);
  if (win) {return;}
  setTimeout(function() {
   aiMoveDisable = false;
  },450);
 }
}
//my code end 
// --- /\ /\ /\  After Game Start /\ /\ /\ ---



charsBtnGen1();
charsBtnGen2();
