/**
 * Tic Tac Toe
 *
 * A Tic Tac Toe game in HTML/JavaScript/CSS.
 *
 * No dependencies - Uses Vanilla JS
 *
 * @author: Vasanth Krishnamoorthy
 */
var N_SIZE = 3,
  EMPTY = '&nbsp;',
  boxes = [],
  availableBoxes = [],
  currentGameMoves = [],
  turn = 'X',
  score,
  turnTimer,
  moves;

let isOver = false;
/**
 * Initializes the Tic Tac Toe board and starts the game.
 */

function init() {
  displayCurrentUserName();
  createGame();
}

function displayCurrentUserName () {
  /* Get user display name for banner */
  firebase.auth().onAuthStateChanged(function(user) {
    let currentUserDisplayName = "Guest";
    currentUserDisplayName = user? 
        user.displayName : currentUserDisplayName;
    const item = document.getElementById("showDisplayName");
    const text = document.createTextNode(currentUserDisplayName);
    item.appendChild(text); 
  });
}

function saveGameHistory(winner) {
  const currentUser = firebase.auth().currentUser;
  if(currentUser === null) return;
  const newGameId = uuidv4();
  const data = Date.now(); //raw timestamp
  // firebase.database().ref('/games/' + newGameId).set({
  //   userId: currentUser.uid,
  //   gameType: "Regular", //play against self
  //   winner: winner,
  //   timestamp: data,
  //   status: "win" //user always win for this mode
  // });
  firebase.database().ref('/games/' + newGameId).set({
    userId: currentUser.uid,
    gameType: "Easy AI", //play against Easy AI
    winner: winner,
    timestamp: data,
    status: "win" //user always win for this mode
  });
}

function home() {
  window.location.href = "menu.html";
}

function createGame() {
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
 * New game
 */
function startNewGame() {
  score = {
    'X': 0,
    'O': 0
  };
  availableBoxes = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  currentGameMoves = [];
  moves = 0;
  turn = 'X';
  boxes.forEach(function (square) {
    square.innerHTML = EMPTY;
  });
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
      turn = turn === 'X' ? 'O' : 'X';
      isOver = true;
      saveGameHistory(turn); //save record
      document.getElementById('turn').textContent = 'Winner by timeout: Player ' + turn;
    }
    document.getElementById('progressBar').value = 100 - timeSpent;
    timeSpent += 5;
  }, 500);
  if (win(clicked)) {
    //alert('Winner: Player ' + turn);
    clearInterval(turnTimer);
    isOver = true;
    saveGameHistory(turn); //save record
    document.getElementById('turn').textContent = 'Winner: Player ' + turn;
  } else if (moves === N_SIZE * N_SIZE) {
    clearInterval(turnTimer);
    isOver = true;
    document.getElementById('turn').textContent = 'Draw';
  } else {
    turn = turn === 'X' ? 'O' : 'X';
    document.getElementById('turn').textContent = 'Player ' + turn;
    if(turn === 'O') {
      setTimeout(easy_ai_turn, 3000);
    }
  }
}

function ai_set(selected_square) {
  clearInterval(turnTimer);
  if (boxes[selected_square].innerHTML !== EMPTY || isOver) {
    return;
  }
  boxes[selected_square].innerHTML = turn;
  moves += 1;
  score[turn] += selected_square;
  currentGameMoves.push(selected_square);
  const index = availableBoxes.indexOf(selected_square);
  availableBoxes.splice(index, 1);
  check_game_status(boxes[selected_square]);
}

/**
 * Sets clicked square and also updates the turn.
 */
function set() {
  clearInterval(turnTimer);
  if (this.innerHTML !== EMPTY || isOver) {
    return;
  }
  this.innerHTML = turn;
  moves += 1;
  score[turn] += this.identifier;
  currentGameMoves.push(this.identifier);
  const index = availableBoxes.indexOf(this.identifier);
  availableBoxes.splice(index, 1);
  check_game_status(this);
}

function easy_ai_turn() {
  //document.getElementById('turn').textContent = 'In AI Turn';
  var random_select = Math.floor(Math.random() * availableBoxes.length);
  document.getElementById('turn').textContent = 'Available length: ' + availableBoxes.length + ', Index: ' + random_select + ", Value at index: " + availableBoxes[random_select];
  ai_set(availableBoxes[random_select]);
  turn = 'X';
  //document.getElementById('turn').textContent = 'Done';
}

function onStartNewGameClicked() {
  isOver = false;
  startNewGame();
  document.getElementById('turn').textContent = 'Player ' + turn;
}

init();
