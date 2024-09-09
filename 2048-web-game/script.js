const gameBoard = document.getElementById('game-board');
let board = [];

function initGame() {
    board = Array(4).fill().map(() => Array(4).fill(0));
    addNewTile();
    addNewTile();
    renderBoard();
}

function addNewTile() {
    const emptyTiles = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                emptyTiles.push({i, j});
            }
        }
    }
    if (emptyTiles.length > 0) {
        const {i, j} = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
}

function renderBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement('div');
            tile.className = `tile ${board[i][j] ? 'tile-' + board[i][j] : ''}`;
            tile.textContent = board[i][j] || '';
            gameBoard.appendChild(tile);
        }
    }
}

function move(direction) {
    let moved = false;
    const newBoard = JSON.parse(JSON.stringify(board));

    function moveLeft(row) {
        const originalRow = [...row];
        const filtered = row.filter(val => val !== 0);
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i + 1]) {
                filtered[i] *= 2;
                filtered[i + 1] = 0;
                moved = true;
            }
        }
        const newRow = filtered.filter(val => val !== 0);
        while (newRow.length < 4) {
            newRow.push(0);
        }
        if (JSON.stringify(originalRow) !== JSON.stringify(newRow)) {
            moved = true;
        }
        return newRow;
    }

    if (direction === 'left') {
        for (let i = 0; i < 4; i++) {
            newBoard[i] = moveLeft(newBoard[i]);
        }
    } else if (direction === 'right') {
        for (let i = 0; i < 4; i++) {
            newBoard[i] = moveLeft(newBoard[i].reverse()).reverse();
        }
    } else if (direction === 'up') {
        for (let j = 0; j < 4; j++) {
            const column = [newBoard[0][j], newBoard[1][j], newBoard[2][j], newBoard[3][j]];
            const newColumn = moveLeft(column);
            for (let i = 0; i < 4; i++) {
                newBoard[i][j] = newColumn[i];
            }
        }
    } else if (direction === 'down') {
        for (let j = 0; j < 4; j++) {
            const column = [newBoard[3][j], newBoard[2][j], newBoard[1][j], newBoard[0][j]];
            const newColumn = moveLeft(column);
            for (let i = 0; i < 4; i++) {
                newBoard[3 - i][j] = newColumn[i];
            }
        }
    }

    if (moved) {
        board = newBoard;
        addNewTile();
        renderBoard();
    }
    
    // 检查游戏是否结束
    if (!canMove()) {
        alert("游戏结束！");
    }
}

// 添加一个新函数来检查是否还能移动
function canMove() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                return true;
            }
            if (i < 3 && board[i][j] === board[i + 1][j]) {
                return true;
            }
            if (j < 3 && board[i][j] === board[i][j + 1]) {
                return true;
            }
        }
    }
    return false;
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            move('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            move('right');
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            move('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            move('down');
            break;
    }
});

initGame();