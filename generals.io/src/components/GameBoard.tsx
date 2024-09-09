import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Game, GameState } from '../game/Game';
import { Tile, TileType } from '../game/Tile';
import { Player } from '../game/Player';
import './GameBoard.css';

const GameBoard: React.FC = () => {
  const [game, setGame] = useState<Game>(() => {
    const newGame = new Game();
    newGame.startGame(); // Initialize the game immediately
    return newGame;
  });
  const [gameState, setGameState] = useState<GameState>(game.getState());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateGameState = useCallback(() => {
    setGameState(game.getState());
  }, [game]);

  useEffect(() => {
    updateGameState();
  }, [game, updateGameState]);

  useEffect(() => {
    if (game.isRunning) {
      timerRef.current = setInterval(() => {
        game.nextTurn();
        const updatedGame = new Game(game);
        setGame(updatedGame);
        setGameState(updatedGame.getState());
      }, 500);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [game]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!game.isRunning) return;

      let direction: 'up' | 'down' | 'left' | 'right' | null = null;
      switch (e.key.toLowerCase()) {
        case 'w':
          direction = 'up';
          break;
        case 's':
          direction = 'down';
          break;
        case 'a':
          direction = 'left';
          break;
        case 'd':
          direction = 'right';
          break;
      }

      if (direction) {
        const moved = game.movePlayer(direction);
        if (moved) {
          const updatedGame = new Game(game);
          setGame(updatedGame);
          setGameState(updatedGame.getState());
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [game]);

  const handleTileClick = (x: number, y: number) => {
    if (!game.isRunning) return;

    const clickedTile = gameState.map[y][x];

    if (gameState.selectedTile) {
      if (gameState.selectedTile.x === x && gameState.selectedTile.y === y) {
        setGameState(prevState => ({ ...prevState, selectedTile: null }));
      } else {
        const moved = game.moveUnits(gameState.selectedTile.x, gameState.selectedTile.y, x, y);
        if (moved) {
          const updatedGame = new Game(game);
          setGame(updatedGame);
          const newSelectedTile = clickedTile.owner === 0 ? { x, y } : null;
          setGameState({ ...updatedGame.getState(), selectedTile: newSelectedTile });
        } else {
          if (clickedTile.owner === 0) {
            setGameState(prevState => ({ ...prevState, selectedTile: { x, y } }));
          }
        }
      }
    } else {
      if (clickedTile.owner === 0) {
        setGameState(prevState => ({ ...prevState, selectedTile: { x, y } }));
      }
    }
  };

  const renderTile = (tile: Tile, x: number, y: number) => {
    let className = 'tile';
    switch (tile.type) {
      case TileType.MOUNTAIN:
        className += ' mountain';
        break;
      case TileType.CITY:
        className += ' city';
        break;
      case TileType.GENERAL:
        className += ' general';
        break;
    }
    if (tile.owner !== null) {
      const player = gameState.players[tile.owner];
      className += ` player-${player.id}`;
      if (gameState.selectedTile && gameState.selectedTile.x === x && gameState.selectedTile.y === y) {
        className += ' selected';
      }
      const style = { backgroundColor: player.color };
      return (
        <div
          key={`${x}-${y}`}
          className={className}
          style={style}
          onClick={() => handleTileClick(x, y)}
        >
          {tile.units > 0 && <span className="units">{tile.units}</span>}
          {tile.type === TileType.GENERAL && <span className="general-marker">G</span>}
        </div>
      );
    }

    return (
      <div
        key={`${x}-${y}`}
        className={className}
        onClick={() => handleTileClick(x, y)}
      >
        {tile.units > 0 && <span className="units">{tile.units}</span>}
      </div>
    );
  };

  const handleStartGame = () => {
    game.startGame();
    const updatedGame = new Game(game);
    setGame(updatedGame);
    setGameState(updatedGame.getState());
  };

  const handleRestartGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    game.restartGame();
    const updatedGame = new Game(game);
    setGame(updatedGame);
    setGameState(updatedGame.getState());
  };

  return (
    <div className="game-container">
      <div className="game-controls">
        <button onClick={handleStartGame} disabled={game.isRunning}>Start Game</button>
        <button onClick={handleRestartGame}>Restart Game</button>
      </div>
      <div className="game-info">
        <p>Turn: {gameState.turn}</p>
        <p>Current Player: {gameState.currentPlayerIndex === 0 ? 'Human' : 'Bot'}</p>
        {gameState.players.length === 2 && (
          <>
            <p>Player (Human): <span style={{ color: gameState.players[0].color }}>■</span></p>
            <p>Bot: <span style={{ color: gameState.players[1].color }}>■</span></p>
          </>
        )}
      </div>
      <div className="game-board">
        {gameState.map.map((row, y) => (
          <div key={y} className="row">
            {row.map((tile, x) => renderTile(tile, x, y))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;