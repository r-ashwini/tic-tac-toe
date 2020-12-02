/**
 * Tic Tac Toe
 *
 * A Tic Tac Toe game in HTML/JavaScript/CSS.
 *
 * Adapted from a Tic Tac Toe game by Vasanth Krishnamoorthy
 *
 * @author: Neil Cai, Purrnima Dayanandam, Liwen Fan, Monali Khobragade, Ashwini Rudrawar, Will Thomas, Kevin Wang
 */

var symbols = ["👍", "❤️"];
var N_SIZE = 3,
  EMPTY = '&nbsp;',
  boxes = [],
  availableBoxes = [],
  currentGameMoves = [],
  gameType,
  turn = symbols[0],
  score = [0, 0],
  turnTimer,
  moves,
  isOver;

/**
 * Initializes the Tic Tac Toe board and starts the game.
 */

function displayCurrentUserName () {
  /* Get user display name for banner */
  firebase.auth().onAuthStateChanged(function(user) {
    let currentUserDisplayName = "Guest";
    currentUserDisplayName = user ? user.displayName : currentUserDisplayName;
    const item = document.getElementById("showDisplayName");
    const text = document.createTextNode(currentUserDisplayName);
    item.appendChild(text); 
  });
}

function saveGameHistory(winner) {
  let status = 0;
  if(winner === symbols[0]) {
    score[0]++;
    status = 1; // Player won
  } else if(winner === symbols[1]) {
    score[1]++;
    status = -1; //Opponent won
  } else {
    status = 0; //Draw
  }
  const currentUser = firebase.auth().currentUser;
  if(currentUser === null) return;
  const newGameId = uuidv4();
  const data = Date.now(); //raw timestamp
  firebase.database().ref('/games/' + newGameId).set({
    userId: currentUser.uid,
    userName: currentUser.displayName,
    gameType: gameType, //play against Easy AI
    winner: winner,
    timestamp: data,
    status: status
  });
}

function home() {
  window.location.href = "menu.html";
}

function printToGameLog(text) {
  var gameLog = document.getElementById('gamelog');
  document.getElementById('gamelog').innerHTML += text + '<br />';
  gameLog.scrollTop = gameLog.scrollHeight;
}

/**
 * New game
 */
function startNewGame() {
  boxes.forEach(function (cell) {
    cell.innerHTML = EMPTY;
  });
  availableBoxes = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  currentGameMoves = [];
  moves = 0;
  turn = symbols[0];
  isOver = false;
  printToGameLog('New game started!');
  printToGameLog('Player ' + symbols[0] + " score: " + score[0]);
  printToGameLog('Player ' + symbols[1] + " score: " + score[1]);
}

function onStartNewGameClicked() {
  startNewGame();
  document.getElementById('turn').textContent = 'Player ' + turn;
}

function createGame() {
  document.getElementById("game_box").style.display = "block";
  var board = document.createElement('table');
  board.setAttribute('border', 1);
  board.setAttribute('cellspacing', 0);

  var identifier = 0;
  for (var i = 0; i < N_SIZE; i++) {
    var row = document.createElement('tr');
    board.appendChild(row);
    for (var j = 0; j < N_SIZE; j++) {
      var cell = document.createElement('td');
      cell.setAttribute('height', 120);
      cell.setAttribute('width', 120);
      cell.setAttribute('align', 'center');
      cell.setAttribute('valign', 'center');
      cell.classList.add('col' + j, 'row' + i);
      if (i == j) {
        cell.classList.add('diagonal0');
      }
      if (j == N_SIZE - i - 1) {
        cell.classList.add('diagonal1');
      }
      cell.identifier = identifier;
      cell.addEventListener('click', set);
      row.appendChild(cell);
      boxes.push(cell);
      identifier++;
    }
  }
  document.getElementById('tictactoe').appendChild(board);
  document.getElementById('startNewGame').disabled = false;
  document.getElementById("startNewGame").onclick = function() {onStartNewGameClicked()};
  startNewGame();
}

/**
 * Check if a win or not
 */
function win(clicked) {
  // Get all cell classes
  var memberOf = clicked.className.split(/\s+/);
  for (var i = 0; i < memberOf.length; i++) {
    var testClass = '.' + memberOf[i];
    var items = contains('#tictactoe ' + testClass, turn);
    // winning condition: turn == N_SIZE
    if (items.length == N_SIZE) {
      return true;
    }
  }
  return false;
}

/**
 * Helper function to check if NodeList from selector has a particular text
 */
function contains(selector, text) {
  var elements = document.querySelectorAll(selector);
  return [].filter.call(elements, function (element) {
    return RegExp(text).test(element.textContent);
  });
}

function check_game_status(clicked) {
  var timeSpent = 0;
  turnTimer = setInterval(function(){
    if(timeSpent >= 100){
      clearInterval(turnTimer);
      isOver = true;
      saveGameHistory(turn); //save record
      document.getElementById('turn').textContent = 'Winner by timeout: Player ' + turn;
      printToGameLog('Move ' + moves + ': Player ' + turn + ' won!');
      printToGameLog('--------------------------');
    }
    document.getElementById('progressBar').value = 100 - timeSpent;
    timeSpent += 5;
  }, 500);
  // if a player has won
  if (win(clicked)) {
    //alert('Winner: Player ' + turn);
    clearInterval(turnTimer);
    isOver = true;
    saveGameHistory(turn); //save record
    document.getElementById('turn').textContent = 'Winner: Player ' + turn;
    printToGameLog('Move ' + moves + ': Player ' + turn + ' won!');
    printToGameLog('--------------------------');
  // if all cells are occupied -> game draw
  } else if (moves === N_SIZE * N_SIZE) {
    clearInterval(turnTimer);
    isOver = true;
    saveGameHistory("Draw");
    document.getElementById('turn').textContent = 'Draw';
    printToGameLog('Move ' + moves + ': Game ended in a draw!');
    printToGameLog('--------------------------');
  } else {
    turn = turn === symbols[0] ? symbols[1] : symbols[0];
    document.getElementById('turn').textContent = 'Player ' + turn;
    if(gameType == "vsAI") {
      if(turn === symbols[1]) {
        boxes.forEach(function (cell) {
          cell.removeEventListener('click', set);
        });
        setTimeout(easy_ai_turn, 3000);
      } else {
        boxes.forEach(function (cell) {
          cell.addEventListener('click', set);
        });
      }
    }
  }
}

function ai_set(selected_cell) {
  if (boxes[selected_cell].innerHTML !== EMPTY || isOver) {
    return;
  }
  clearInterval(turnTimer);
  moves++;
  printToGameLog('Move ' + moves + ': Player ' + turn + ' selected cell ' + selected_cell);
  boxes[selected_cell].innerHTML = turn;
  currentGameMoves.push(selected_cell);
  const index = availableBoxes.indexOf(selected_cell);
  availableBoxes.splice(index, 1);
  check_game_status(boxes[selected_cell]);
}

/**
 * Sets clicked cell and also updates the turn.
 */
function set() {
  if (this.innerHTML !== EMPTY || isOver) {
    return;
  }
  clearInterval(turnTimer);
  moves++;
  printToGameLog('Move ' + moves + ': Player ' + turn + ' selected cell ' + this.identifier);
  this.innerHTML = turn;
  currentGameMoves.push(this.identifier);
  const index = availableBoxes.indexOf(this.identifier);
  availableBoxes.splice(index, 1);
  check_game_status(this);
}

function easy_ai_turn() {
  //document.getElementById('turn').textContent = 'In AI Turn';
  var random_select = Math.floor(Math.random() * availableBoxes.length);
  ai_set(availableBoxes[random_select]);
  //document.getElementById('turn').textContent = 'Done';
}

function select_symbol() {
  symbols[0] = this.innerHTML;
  var player1 = symbols[0];
  var player2 = symbols[1];
  document.getElementById("symbol_modal").style.display = "none";
  createGame();
}

function symbol_picker() {
  var symbol_list = document.createElement('table');
  var row = document.createElement('tr');
  symbol_list.setAttribute('border', 1);
  symbol_list.setAttribute('cellspacing', 0);
  symbol_list.appendChild(row);
  var symbol_options = ["👍", "👑", "😊", "🔫", "🤠"];

  for (var i = 0; i < 5; i++) {
    var symbol_cell = document.createElement('td');
    symbol_cell.setAttribute('height', 50);
    symbol_cell.setAttribute('width', 50);
    symbol_cell.setAttribute('align', 'center');
    symbol_cell.setAttribute('valign', 'center');
    symbol_cell.identifier = i;
    symbol_cell.innerHTML = symbol_options[i];
    symbol_cell.addEventListener('click', select_symbol);
    row.appendChild(symbol_cell);
  }
  document.getElementById('modal_content').appendChild(symbol_list);
}

function init() {
  let params = new URLSearchParams(location.search);
  gameType = params.get('gameType');
  if (gameType === 'vsSelf') {
    symbols[1] = "❤️";
  }
  else if (gameType === 'vsAI') {
    symbols[1] = "🤖";
  }
  else if (gameType != 'vsSelf' && gameType != 'vsAI') {
    gameType = 'vsSelf'
  }
  displayCurrentUserName();
  symbol_picker();
}

init();
