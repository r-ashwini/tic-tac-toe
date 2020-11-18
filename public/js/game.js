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
  turn = 'X',
  score,
  moves;

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
  firebase.database().ref('/games/' + newGameId).set({
    userId: currentUser.uid,
    gameType: "Regular", //play against self
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

  var identifier = 1;
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
      identifier += identifier;
    }
  }

  document.getElementById('tictactoe').appendChild(board);
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

/**
 * Sets clicked square and also updates the turn.
 */
function set() {
  if (this.innerHTML !== EMPTY) {
    return;
  }
  this.innerHTML = turn;
  moves += 1;
  score[turn] += this.identifier;
  if (win(this)) {
    //alert('Winner: Player ' + turn);
    saveGameHistory(turn); //save record

    document.getElementById('turn').textContent = 'Winner: Player ' + turn;
    document.getElementById('startNewGame').disabled = false;
    document.getElementById("startNewGame").onclick = function() {onStartNewGameClicked()};
    //startNewGame();
  } else if (moves === N_SIZE * N_SIZE) {
    //alert('Draw');
    document.getElementById('turn').textContent = 'Draw';
    document.getElementById('startNewGame').disabled = false;
    document.getElementById("startNewGame").onclick = function() {onStartNewGameClicked()};
    //startNewGame();
  } else {
    turn = turn === 'X' ? 'O' : 'X';
    document.getElementById('turn').textContent = 'Player ' + turn;
  }
}

function onStartNewGameClicked() {
  startNewGame();
  document.getElementById('startNewGame').disabled = true;
  document.getElementById('turn').textContent = 'Player ' + turn;
}

init();
