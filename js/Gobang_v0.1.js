/*
 * Gobang.js v0.3
 *
 * Author: Shijian Wu
 * Date:   2020-02-21
*/


/* ========== all win state ========== */
class WinState {
  constructor() {
    this.wsArray = [];    // win state array
    this.wsCount = 0;    // win state number

    this.createWinStateArray();
    this.presetWinStateOnHLines();
    this.presetWinStateOnVLines();
    this.presetWinStateOnD1Lines();
    this.presetWinStateOnD2Lines();
  }

  /*
   * 3-dimensionality array
   * 1-d: lines: - | \ /
   * 2-d: the first position of a win state
   * 3-d: 5 pieces
   */
  createWinStateArray() {
    for (let i = 0; i < 15; i++) {
      this.wsArray[i] = [];
      for (let j = 0; j < 15; j++) {
        this.wsArray[i][j] = [];
      }
    }
  }

  /* win state on all horizontal lines.
   *
   *   the first position for each win state.
   *   | | | ...               | It cannot be 11 because there are only 4 left..
   *   v v v ...               v
   *   0 1 2 3 4 5 6 7 8 9 10 11 12 13 14  <-- horizontal line
   * 1 o o
   * 2 o o
   *   ...
   */
  presetWinStateOnHLines() {
    for (let i = 0; i < 15; i++) {    // each horizontal line
      for (let j = 0; j < 11; j++) {  // the first position for each win state
        for (let k = 0; k < 5; k++) {
          this.wsArray[i][j + k][this.wsCount] = true;  // it's a win state
        }
        this.wsCount++;
      }
    }
  }

  /* win state on all vertical lines.
   *    win state 
   *    |  |  |  ...
   *    v  v  v
   *    0  1  2  ...
   * 1  o  o  <-- the first position for each win state
   * 2  o  o  <--
   *      ...
   * 10
   * 11  <-- the first position of a win state cannot be 11 ~ 14
   * 12
   * 13
   * 14
   */
  presetWinStateOnVLines() {
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 11; j++) {
        for (let k = 0; k < 5; k++) {
          this.wsArray[j + k][i][this.wsCount] = true;
        }
        this.wsCount++;
      }
    }
  }

  /* anti-diagnol
   *   0 1 2 ...  11 12 13 14
   * 0 \ \ \      ^ 
   * 1  \ \ \ ... | 
   * 2   \ \ \    |
   *    ...       |
   * 11     <----- the first position of a win state cannot be 11 ~ 14
   * 12
   * 13
   * 14
   */
  presetWinStateOnD1Lines() {
    for (let i = 0; i < 11; i++) {
      for (let j = 0; j < 11; j++) {
        for (let k = 0; k < 5; k++) {
          this.wsArray[i + k][j + k][this.wsCount] = 1
        }
        this.wsCount++;
      }
    }
  }

  /* diagnol
   *    0 1 2 3 4 5 ... 10 11 12 13 14
   * 0         /                       0
   * 1        /                        1
   * 2       /  ...                    2
   * 3      /           
   * 4     /
   * 5      the first position of a win state cannot be 0 ~ 3, and 11 ~ 14
   *   ...  
   * 14                  /
   *    0 1 2 3 4 5 ... 10 11 12 13 14 
   */
  presetWinStateOnD2Lines() {
    for (let i = 0; i < 11; i++) {
      for (let j = 14; j > 3; j--) {
        for (let k = 0; k < 5; k++) {
          this.wsArray[i + k][j - k][this.wsCount] = true;
        }
        this.wsCount++;
      }
    }
  }


}
/* ========== win state end ========== */

/* ========== win ========== */
class Win {
  constructor(winState) {
    this.winState = winState;

    /* current pieces for each win state */
    this.playerWin = [];
    this.aiWin = [];
    this.gameOver;

    this.init();
  }

  init() {
    this.gameOver = false;

    for (let i = 0; i < this.winState.wsCount; i++) {
      this.playerWin[i] = 0;
      this.aiWin[i] = 0;
    }
  }

  isFive(row, col, player) {
    for (let i = 0; i < this.winState.wsCount; i++) {
      if (this.winState.wsArray[row][col][i] == true) {  // a win state
        /*
         * This win state adds 1.
         * 5 means this win state has 5 pieces, so it's win
         */
        if (player) {
          this.playerWin[i]++;
          /* as this position was occupied by player, so ai cannot use it. */
          this.aiWin[i] = 99;
          if (this.playerWin[i] == 5) {
            // window.alert("You win!");
            this.showGameResult(player);
            this.gameOver = true;
          }
        } else {
          this.aiWin[i]++;
          /* as this position was occupied by ai, so player cannot use it. */
          this.playerWin[i] = 99;
          if (this.aiWin[i] == 5) {
            // window.alert("AI win!");
            this.showGameResult(player);
            this.gameOver = true;
          }
        }
      }
    }
  }

  showGameResult(player) {
    let pls = window.sessionStorage.getItem("playerScore");
    let ais = window.sessionStorage.getItem("aiScore");
    if (pls == null) {
      pls = 0;
    }

    if (ais == null) {
      ais = 0;
    }

    let msgElem = document.getElementById("gameResult");
    let scElem = document.getElementById("playerScore");
    if (player) {
      msgElem.innerText = "You win";
      msgElem.className = "bg-success text-white";
      pls++;
    } else {
      msgElem.innerText = "AI win";
      msgElem.className = "bg-danger text-white";
      ais++;
    }

    scElem.innerText = "Player: " + pls + " -- " + "AI: " + ais;
    window.sessionStorage.setItem("playerScore", pls);
    window.sessionStorage.setItem("aiScore", ais);
  }
}

/* ========== chess board (UI) ========== */
class ChessBoard {
  constructor() {
    this.canvas = document.getElementById("boardCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.positions = [];
    this.playerTurn;
    this.drawBoard();
    this.init();
  }

  drawBoard() {
    this.ctx.strokeStyle = "black";
  
    for (let i = 0; i < 15; i++) {
      this.ctx.moveTo(15 + i * 30, 15);
      this.ctx.lineTo(15 + i * 30, 435);
      this.ctx.stroke();
      this.ctx.moveTo(15, 15 + i * 30);
      this.ctx.lineTo(435, 15 + i * 30);
      this.ctx.stroke();
    }
  }

  init() {
    this.playerTurn = true;

    for (let i = 0; i < 15; i++) {
      this.positions[i] = [];
      for (let j = 0; j < 15; j++) {
        this.positions[i][j] = 0;
      }
    }
  }

  isAvailable(row, col) {
    return this.positions[row][col] == 0;
  }

  setOccupied(row, col) {
    if (this.isPlayerTurn) {
      this.positions[row][col] = 1;
    } else {
      this.positions[row][col] = 2;
    }
    
  }

  isPlayerTurn() {
    return this.playerTurn;
  }

  setPlayerTurn(playerTurn) {
    this.playerTurn = playerTurn;
  }

  addPiece(row, col) {
    let x = col * 30 + 15;
    let y = row * 30 + 15;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 12, 0, 2 * Math.PI);
    this.ctx.closePath();
    this.ctx.fillStyle = (this.isPlayerTurn() ? "black" : "white");
    this.ctx.fill();
    this.setOccupied(row, col);
  }
}
/* ========== chess board end ========== */


/* ========== AI ========== */
class AI {
  
  constructor(chessBoard, winState, win) {
    this.chessBoard = chessBoard;
    this.winState = winState;
    this.win = win;

    this.mostValuablePosition = [0, 0];
  }

  evaluatePositionsValue() {
    let playerScore = [];
    let aiScore = [];
    let maxValue = 0;

    for (let i = 0; i < 15; i++) {
      playerScore[i] = [];
      aiScore[i] = [];
      for (let j = 0; j < 15; j++) {
        playerScore[i][j] = 0;
        aiScore[i][j] = 0;
      }
    }

    let x = 0, y = 0;

    for (let i = 0; i < 15; i++) {    // row
      for (let j = 0; j < 15; j++) {  // col
        if (this.chessBoard.isAvailable(i, j)) {
          for (let k = 0; k < this.winState.wsCount; k++) {
            if (this.winState.wsArray[i][j][k]) {  // a win state
              // me
              if (this.win.playerWin[k] == 1) {  // this win state has 1 piece
                /* position value */
                playerScore[i][j] += 200;
              } else if (this.win.playerWin[k] == 2) {  // this win state has 2 pieces
                /* position value */
                playerScore[i][j] += 400;
              } else if (this.win.playerWin[k] == 3) {  // this win state has 3 pieces
                /* position value */
                playerScore[i][j] += 2000;
              } else if (this.win.playerWin[k] == 4) {  // this win state has 4 pieces
                /* position value */
                playerScore[i][j] += 10000;
              }

              // ai
              if (this.win.aiWin[k] == 1) {  // this win state has 1 piece
                /* position value */
                aiScore[i][j] += 220;
              } else if (this.win.aiWin[k] == 2) {  // this win state has 2 pieces
                /* position value */
                aiScore[i][j] += 420;
              } else if (this.win.aiWin[k] == 3) {  // this win state has 3 pieces
                /* position value */
                aiScore[i][j] += 2100;
              } else if (this.win.aiWin[k] == 4) {  // this win state has 4 pieces
                /* position value */
                aiScore[i][j] += 20000;
              }
            }
          }

          // calculate the most advantageous position
          if (playerScore[i][j] > maxValue) {
            maxValue = playerScore[i][j];
            x = i;
            y = j;
          } else if (playerScore[i][j] == maxValue) {
            if (aiScore[i][j] > aiScore[x][y]) {
              x = i;
              y = j;
            }
          }

          if (aiScore[i][j] > maxValue) {
            maxValue = aiScore[i][j];
            x = i;
            y = j;
          } else if (aiScore[i][j] == maxValue) {
            if (playerScore[i][j] > playerScore[x][y]) {
              x = i;
              y = j;
            }
          }
        }
      }
    }

    this.mostValuablePosition[0] = x;
    this.mostValuablePosition[1] = y;
  }

  aiTurn() {
    if (!this.win.gameOver) {
      this.evaluatePositionsValue();
      let row = this.mostValuablePosition[0];
      let col = this.mostValuablePosition[1];
      this.chessBoard.addPiece(row, col);
      this.win.isFive(row, col);
      if (!this.win.gameOver) {
        // player turn
        this.chessBoard.setPlayerTurn(true);
      }
    }
  }
}
/* ========== AI end ========== */


function playerTurn(event) {
  let row = Math.floor(event.offsetY / 30);
  let col = Math.floor(event.offsetX / 30);
  if (!win.gameOver) {
    if (chessBoard.isPlayerTurn()) {
      if (chessBoard.isAvailable(row, col)) {
        chessBoard.addPiece(row, col);
        win.isFive(row, col, true);
        if (!win.gameOver) {
          chessBoard.setPlayerTurn(false);
          ai.aiTurn();
        }
      } else {
        alert("You cannot put a piece here.");
      }
    }
  }
}

function newGame() {
  location.reload();
}




/* ========== start game ========== */
const winState = new WinState();
const win = new Win(winState);
const chessBoard = new ChessBoard();
const ai = new AI(chessBoard, winState, win);
document.getElementById("boardCanvas").addEventListener("click", playerTurn);
document.getElementById("newGame").addEventListener("click", newGame);
