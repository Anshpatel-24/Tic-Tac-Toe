/* index.js
   Shared by home and game pages.
   - index.html uses only its inline script for mode selection
   - game.html loads this file to run the actual game
*/

/* ---------- Game state variables ---------- */
let currentPlayerElem = null;

let player1 = '';
let player2 = '';

let gameMode = 'pvp'; // "pvp" or "ai"

let btnX = [];
let btnO = [];

let presscount; // false => X's turn (player1), true => O's turn (player2)
let P1score = 0;
let P2score = 0;
let tie = 0;

/* ---------- Called on game.html load ---------- */
(function setupGamePageIfNeeded() {
  // detect if this is game.html by checking if an element with id "start-game" exists
  if (!document.getElementById('start-game')) return;

  // initialize DOM refs
  currentPlayerElem = document.getElementById('current-Player');

  // read stored mode and names from localStorage
  const storedMode = localStorage.getItem('ttt_mode');
  const storedP1 = localStorage.getItem('ttt_p1');
  const storedP2 = localStorage.getItem('ttt_p2');

  if (!storedMode || !storedP1) {
    // nothing set — send user back to home
    alert('No game mode selected. Redirecting to home.');
    window.location.href = 'index.html';
    return;
  }

  gameMode = storedMode;
  player1 = storedP1;
  player2 = storedP2 || (gameMode === 'ai' ? 'Computer (AI)' : 'Player 2');

  // show selected mode banner
  const banner = document.getElementById('mode-banner');
  banner.innerText = gameMode === 'ai' ? 'Mode : Player vs AI' : 'Mode : Player vs Player';

  // populate player containers (scores updated on GameStart)
  document.getElementById('p1container').innerHTML = `
    <div id="Player-1" class="P_lables">${player1}'s Winning Score : <span>${P1score}</span></div>
  `;

  document.getElementById('p2container').innerHTML = `
    <div id="Player-2" class="P_lables">${player2}'s Winning Score : <span>${P2score}</span></div>
  `;

  // show/hide fields depending on mode (player can still re-enter names on game page if you want)
  // attach keyboard accessibility: pressing Enter on Start triggers GameStart
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const active = document.activeElement;
      // don't trigger if focus is inside inputs (not required but safe)
      if (active && active.tagName === 'INPUT') return;
      GameStart();
    }
  });
})();

/* ---------- Start / Reset game ---------- */
function GameStart() {
  // reset arrays & flags
  btnX = [];
  btnO = [];
  presscount = false; // X starts

  // reset board buttons
  let allGameBtns = document.getElementsByClassName('gameBTNs');
  for (let i = 0; i < allGameBtns.length; i++) {
    allGameBtns[i].disabled = false;
    allGameBtns[i].innerText = '';
    allGameBtns[i].style.backgroundColor = '#a2e0fa';
    allGameBtns[i].style.border = '0.8vmin solid #007bff';
    allGameBtns[i].classList.remove('show-win-animation');
  }

  // read names again if user changed them on game page (optional)
  const storedP1 = localStorage.getItem('ttt_p1');
  const storedP2 = localStorage.getItem('ttt_p2');
  if (storedP1) player1 = storedP1;
  if (storedP2) player2 = storedP2;

  // ensure required names present
  if (gameMode === 'pvp' && (player1 === '' || player2 === '')) {
    alert('Please set both player names (Player vs Player).');
    return;
  }
  if (gameMode === 'ai' && player1 === '') {
    alert('Please set Player name (AI will play as O).');
    return;
  }

  // UI toggles
  document.querySelector('#resetBTN').style.display = 'block';
  document.querySelector('#rePlayBTN').style.display = 'block';
  document.getElementById('start-game').style.display = 'none';
  document.getElementById('game-board').style.display = 'block';

  // update score displays
  let p1_cont = document.querySelector('#p1container');
  p1_cont.innerHTML = `
      <div class="P_lables" id="Player-1">
          ${player1}'s Winning Score : <span>${P1score}</span>
      </div>`;

  let p2_cont = document.querySelector('#p2container');
  p2_cont.innerHTML = `
      <div class="P_lables" id="Player-2">
          ${player2}'s Winning Score : <span>${P2score}</span>
      </div>
  `;

  currentPlayerElem.style.display = 'block';
  currentPlayerElem.style.backgroundColor = 'rgb(167, 248, 167)';
  currentPlayerElem.style.color = 'darkgreen';
  currentPlayerElem.style.border = '1vmin solid rgb(108 204 117)';
  currentPlayerElem.innerText = `${player1}'s Turn`;

  // If AI mode and we want AI to optionally start (currently player always X). You could add option.
}

/* ---------- Main click handler (your original logic preserved) ---------- */
function pressBTN(id) {
  let btn = document.getElementById(id);

  if (!presscount) {
    // X's move (player1)
    currentPlayerElem.innerText = `${player2}'s Turn`;
    currentPlayerElem.style.backgroundColor = '#ffffaf';
    currentPlayerElem.style.color = '#b98800';
    currentPlayerElem.style.border = '1vmin solid #ccaa6c';

    btn.innerText = 'X';
    btn.style.color = '#0ab900';
    btn.style.backgroundColor = 'rgb(175 255 176)';
    btn.style.border = '1vmin solid rgb(108 204 117)';
    btn.disabled = true;
    presscount = true;

    // store X move
    // original code used btn.id[5] to get digit; keep same behavior
    btnX.push(btn.id[5]);

    if (btnX.length >= 3) {
      P1score = winCheck(btnX, player1, P1score);
      let player1_Info = document.getElementById('Player-1');
      player1_Info.innerHTML = ` ${player1}'s Winning Score : <span>${P1score}</span>`;
    }

    // If AI mode, let AI move (after small delay)
    if (gameMode === 'ai' && !isGameOver()) {
      // small delay to simulate thinking
      setTimeout(aiMove, 350);
    }

  } else {
    // O's move (player2) — in PvP OR triggered by AI's simulated click
    // In PvP mode this block runs when a human clicks; in AI mode it's executed when AI triggers .click()
    currentPlayerElem.innerText = `${player1}'s Turn`;
    currentPlayerElem.style.backgroundColor = 'rgb(175 255 176)';
    currentPlayerElem.style.color = 'darkgreen';
    currentPlayerElem.style.border = '1vmin solid rgb(108 204 117)';

    btn.innerText = 'O';
    btn.style.color = '#b98800';
    btn.style.backgroundColor = '#ffffaf';
    btn.style.border = '1vmin solid #ccaa6c';
    btn.disabled = true;
    presscount = false;

    btnO.push(btn.id[5]);

    if (btnO.length >= 3) {
      P2score = winCheck(btnO, player2, P2score);
      let player2_Info = document.getElementById('Player-2');
      player2_Info.innerHTML = ` ${player2}'s Winning Score : <span>${P2score}</span>`;
    }
  }
}

/* ---------- Win checks (kept your logic) ---------- */
let win = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]];
// tie variable declared earlier

function winCheck(btnNo , name , score) {
  let tieCheck = true;
  let checkBTNs = 0;

  for (let i = 0 ; i < win.length ; i++) {
    for (let j = 0 ; j < 3 ; j++) {
      for (let k=0; k<5; k++) {
        if (win[i][j] == btnNo[k]) {
          checkBTNs++;
        }
      }
    }

    if (checkBTNs === 3) {
      score++;
      tieCheck = false;

      currentPlayerElem.innerText = `${name} win the game.`;
      currentPlayerElem.style.backgroundColor = '#a2e0fa';
      currentPlayerElem.style.color = 'darkblue';
      currentPlayerElem.style.border = '1vmin solid blue';
      showResultPopup();

      for (let a = 0; a < 3; a++) {
        let btns = document.querySelector(`#gBTN-${win[i][a]}`);
        btns.classList.add('show-win-animation');
      }

      let allGameBtns = document.getElementsByClassName('gameBTNs');
      for (let i = 0; i < allGameBtns.length ; i++) {
        allGameBtns[i].disabled = true;
      }

      checkBTNs = 0;
      return score;
    }
    checkBTNs = 0;
  }

  // tie detection: original logic checks btnNo length == 5 which works when checking X array at end
  if (tieCheck && btnNo.length == 5) {
    tie++;

    currentPlayerElem.innerText = `The game is Tie.`;
    currentPlayerElem.style.backgroundColor = '#a2e0fa';
    currentPlayerElem.style.color = 'darkblue';
    currentPlayerElem.style.border = '1vmin solid blue';
    showResultPopup();

    let Tie_sec = document.querySelector('#Tie');
    Tie_sec.style.display = 'block';
    Tie_sec.innerHTML = `Tie Matches : <span>${tie}</span>`;
  }

  return score;
}

function showResultPopup() {
  if (currentPlayerElem) {
    currentPlayerElem.classList.remove('show-popup');
    void currentPlayerElem.offsetWidth;
    currentPlayerElem.classList.add('show-popup');
  }
}

/* ---------- AI (Minimax) ---------- */
/*
  Approach:
  - We will inspect DOM buttons (document.getElementsByClassName('gameBTNs'))
  - For minimax evaluation we read innerText ('' | 'X' | 'O')
  - The aiMove function tests each empty spot, runs minimax, and chooses the move with best score.
*/

function aiMove() {
  // choose best move for 'O'
  let allGameBtns = document.getElementsByClassName('gameBTNs');
  let bestScore = -Infinity;
  let bestBtn = null;

  for (let i = 0; i < allGameBtns.length; i++) {
    if (allGameBtns[i].innerText === '') {
      // try move
      allGameBtns[i].innerText = 'O';
      let score = minimax(allGameBtns, 0, false);
      allGameBtns[i].innerText = '';

      if (score > bestScore) {
        bestScore = score;
        bestBtn = allGameBtns[i];
      }
    }
  }

  // If something found, simulate click to reuse pressBTN logic and animations
  if (bestBtn) {
    // Using .click() will call pressBTN() because element has onclick handler
    bestBtn.click();
  }
}

function minimax(board, depth, isMaximizing) {
  // terminal check
  let evalResult = evaluateBoard(board);
  if (evalResult !== null) {
    // If evalResult is numeric (10, -10, 0) — return with small depth adjustment (to prefer quicker wins)
    // but keep it simple: just return evalResult
    return evalResult;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i].innerText === '') {
        board[i].innerText = 'O';
        let score = minimax(board, depth + 1, false);
        board[i].innerText = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i].innerText === '') {
        board[i].innerText = 'X';
        let score = minimax(board, depth + 1, true);
        board[i].innerText = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function evaluateBoard(board) {
  // patterns use zero-based index of board (0..8)
  let winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (let pattern of winPatterns) {
    let [a,b,c] = pattern;
    if (board[a].innerText !== '' &&
        board[a].innerText === board[b].innerText &&
        board[a].innerText === board[c].innerText) {
      if (board[a].innerText === 'O') return 10;
      else return -10;
    }
  }

  // draw check
  let emptySpots = 0;
  for (let i = 0; i < board.length; i++) if (board[i].innerText === '') emptySpots++;
  if (emptySpots === 0) return 0;

  return null;
}

function isGameOver() {
  let allGameBtns = document.getElementsByClassName('gameBTNs');
  return evaluateBoard(allGameBtns) !== null;
}

/* ---------- Utility: navigate back to home ---------- */
function backToHome() {
  // clear stored values if you want
  localStorage.removeItem('ttt_mode');
  localStorage.removeItem('ttt_p1');
  localStorage.removeItem('ttt_p2');

  window.location.href = 'index.html';
}

