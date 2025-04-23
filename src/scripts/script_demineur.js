
    const config = {
      easy: { rows: 9, cols: 9, mines: 10 },
      medium: { rows: 16, cols: 16, mines: 40 },
      hard: { rows: 16, cols: 28, mines: 90 }
    };

    let gameState = {
      board: [],
      mines: 0,
      revealed: 0,
      flagged: 0,
      gameOver: false,
      gameWon: false,
      timer: 0,
      timerInterval: null,
      difficulty: 'easy'
    };

    const boardElement = document.getElementById('board');
    const minesCountElement = document.getElementById('mines-count');
    const timerElement = document.getElementById('timer');
    const resetBtn = document.getElementById('reset-btn');
    const messageElement = document.getElementById('message');
    const easyBtn = document.getElementById('easy-btn');
    const mediumBtn = document.getElementById('medium-btn');
    const hardBtn = document.getElementById('hard-btn');

    function initGame() {
      const { rows, cols, mines } = config[gameState.difficulty];

      gameState = {
        ...gameState,
        board: Array.from({ length: rows }, () =>
          Array.from({ length: cols }, () => ({
            isMine: false,
            revealed: false,
            flagged: false,
            adjacentMines: 0
          }))
        ),
        mines,
        revealed: 0,
        flagged: 0,
        gameOver: false,
        gameWon: false,
        timer: 0
      };

      minesCountElement.textContent = mines;
      timerElement.textContent = '0';
      messageElement.classList.add('hidden');
      resetBtn.textContent = 'Restart';

      if (gameState.timerInterval) clearInterval(gameState.timerInterval);

      renderBoard();
    }

    function placeMines(firstClickRow, firstClickCol) {
      const { rows, cols } = config[gameState.difficulty];
      let minesPlaced = 0;

      while (minesPlaced < gameState.mines) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        const isNear = Math.abs(row - firstClickRow) <= 1 && Math.abs(col - firstClickCol) <= 1;

        if (!gameState.board[row][col].isMine && !isNear) {
          gameState.board[row][col].isMine = true;
          minesPlaced++;

          for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
              if (!(r === row && c === col)) gameState.board[r][c].adjacentMines++;
            }
          }
        }
      }

      gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        timerElement.textContent = gameState.timer;
      }, 1000);
    }

    function renderBoard() {
      const { rows, cols } = config[gameState.difficulty];

      boardElement.className = `grid gap-1  justify-start mx-auto`;
      boardElement.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
      boardElement.innerHTML = '';

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cell = document.createElement('div');
          const cellData = gameState.board[row][col];

          cell.className = `cell flex items-center justify-center text-lg font-bold cursor-pointer rounded text-white`;

          if (cellData.revealed) {
            if (cellData.isMine) {
              cell.classList.add('bg-red-500', 'bomb');
            } else {
              cell.classList.add('bg-gray-700');

              if (cellData.adjacentMines > 0) {
                cell.textContent = cellData.adjacentMines;
                const colors = [
                  '',
                  'text-blue-400',
                  'text-green-400',
                  'text-red-400',
                  'text-purple-400',
                  'text-yellow-400',
                  'text-teal-400',
                  'text-pink-400',
                  'text-gray-400'
                ];
                
                cell.classList.add(colors[cellData.adjacentMines]);
              }
            }
          } else {
            cell.classList.add('bg-green-600', 'hover:bg-green-700');
            if (cellData.flagged) {
              cell.classList.add('flagged');
            }
          }

          cell.dataset.row = row;
          cell.dataset.col = col;

          cell.addEventListener('click', () => handleCellClick(row, col));
          cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            handleRightClick(row, col);
          });

          boardElement.appendChild(cell);
        }
      }
    }

    function handleCellClick(row, col) {
      if (gameState.gameOver || gameState.gameWon || gameState.board[row][col].flagged) return;

      if (gameState.revealed === 0 && !gameState.board[row][col].flagged) {
        placeMines(row, col);
      }

      const cell = gameState.board[row][col];

      if (cell.isMine) {
        revealAllMines();
        gameState.gameOver = true;
        resetBtn.textContent = '😵';
        showMessage('Game Over!', 'text-red-400');
        clearInterval(gameState.timerInterval);
      } else {
        revealCell(row, col);
        const { rows, cols } = config[gameState.difficulty];
        if (gameState.revealed === rows * cols - gameState.mines) {
          gameState.gameWon = true;
          resetBtn.textContent = '😎';
          showMessage('Gagné!', 'text-green-400');
          clearInterval(gameState.timerInterval);
        }
      }

      renderBoard();
    }

    function revealCell(row, col) {
      const { rows, cols } = config[gameState.difficulty];

      if (row < 0 || row >= rows || col < 0 || col >= cols || gameState.board[row][col].revealed || gameState.board[row][col].flagged) {
        return;
      }

      gameState.board[row][col].revealed = true;
      gameState.revealed++;

      if (gameState.board[row][col].adjacentMines === 0 && !gameState.board[row][col].isMine) {
        for (let r = row - 1; r <= row + 1; r++) {
          for (let c = col - 1; c <= col + 1; c++) {
            if (!(r === row && c === col)) revealCell(r, c);
          }
        }
      }
    }

    function handleRightClick(row, col) {
      if (gameState.gameOver || gameState.gameWon || gameState.board[row][col].revealed) return;

      const cell = gameState.board[row][col];

      cell.flagged = !cell.flagged;
      gameState.flagged += cell.flagged ? 1 : -1;
      minesCountElement.textContent = gameState.mines - gameState.flagged;

      renderBoard();
    }

    function revealAllMines() {
      const { rows, cols } = config[gameState.difficulty];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (gameState.board[row][col].isMine) {
            gameState.board[row][col].revealed = true;
          }
        }
      }
    }

    function showMessage(text, colorClass) {
      messageElement.textContent = text;
      messageElement.className = `text-center mt-4 text-xl font-bold ${colorClass}`;
      messageElement.classList.remove('hidden');
    }

    resetBtn.addEventListener('click', initGame);
    easyBtn.addEventListener('click', () => {
      gameState.difficulty = 'easy';
      initGame();
    });
    mediumBtn.addEventListener('click', () => {
      gameState.difficulty = 'medium';
      initGame();
    });
    hardBtn.addEventListener('click', () => {
      gameState.difficulty = 'hard';
      initGame();
    });

    initGame();
 