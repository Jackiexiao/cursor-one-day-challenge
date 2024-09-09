import { Player } from './Player';
import { Tile, TileType } from './Tile';

export class Game {
  map: Tile[][];
  players: Player[];
  currentPlayerIndex: number;
  turn: number;
  isRunning: boolean;

  constructor(existingGame?: Game) {
    if (existingGame) {
      this.map = existingGame.map.map(row => row.map(tile => new Tile(tile.type, tile.units, tile.owner, tile.visible)));
      this.players = existingGame.players.map(player => new Player(player.id, player.name, player.color));
      this.currentPlayerIndex = existingGame.currentPlayerIndex;
      this.turn = existingGame.turn;
      this.isRunning = existingGame.isRunning;
    } else {
      this.map = [];
      this.players = [];
      this.currentPlayerIndex = 0;
      this.turn = 0;
      this.isRunning = false;
    }
  }

  startGame() {
    this.map = this.initializeMap();
    this.players = this.initializePlayers();
    this.currentPlayerIndex = 0;
    this.turn = 1;
    this.isRunning = true;
  }

  initializeMap(): Tile[][] {
    const map: Tile[][] = [];
    for (let y = 0; y < 15; y++) {
      map[y] = [];
      for (let x = 0; x < 15; x++) {
        map[y][x] = new Tile(TileType.EMPTY, 0, null, true);
      }
    }

    // Add mountains (10% of the map)
    for (let i = 0; i < 22; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * 15);
        y = Math.floor(Math.random() * 15);
      } while (map[y][x].type !== TileType.EMPTY);
      map[y][x] = new Tile(TileType.MOUNTAIN, 0, null, true);
    }

    // Add cities (5% of the map)
    for (let i = 0; i < 11; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * 15);
        y = Math.floor(Math.random() * 15);
      } while (map[y][x].type !== TileType.EMPTY);
      map[y][x] = new Tile(TileType.CITY, Math.floor(Math.random() * 11) + 40, null, true);
    }

    return map;
  }

  initializePlayers(): Player[] {
    const players = [
      new Player(0, 'Human', '#ff0000'),
      new Player(1, 'Bot', '#0000ff'),
    ];

    // Place generals and initial soldiers
    const positions = [
      { x: 0, y: 0 },
      { x: 14, y: 14 },
    ];

    for (let i = 0; i < players.length; i++) {
      const { x, y } = positions[i];
      this.map[y][x] = new Tile(TileType.GENERAL, 1, i, true);
    }

    return players;
  }

  getMap(): Tile[][] {
    return this.map;
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }

  getTurn(): number {
    return this.turn;
  }

  nextTurn(): void {
    this.incrementTurn();
    if (this.currentPlayerIndex === 1) {
      this.botMove();
    }
    // We no longer change the currentPlayerIndex here
  }

  incrementTurn(): void {
    this.turn++;
    this.addSoldiersToGeneralsAndCities();
    if (this.turn % 25 === 0) {
      this.addSoldiersToAllTerritories();
    }
    this.updateVisibility();
    this.checkWinCondition();
  }

  botMove(): void {
    const botTiles = this.getPlayerTiles(1);
    if (botTiles.length === 0) return;

    const randomTile = botTiles[Math.floor(Math.random() * botTiles.length)];
    const directions = ['up', 'down', 'left', 'right'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)] as 'up' | 'down' | 'left' | 'right';

    this.movePlayer(randomDirection, 1);
  }

  movePlayer(direction: 'up' | 'down' | 'left' | 'right', playerId: number = this.currentPlayerIndex): boolean {
    const playerTiles = this.getPlayerTiles(playerId);
    if (playerTiles.length === 0) return false;

    const dx = direction === 'left' ? -1 : (direction === 'right' ? 1 : 0);
    const dy = direction === 'up' ? -1 : (direction === 'down' ? 1 : 0);

    let moved = false;
    for (const tile of playerTiles) {
      const newX = tile.x + dx;
      const newY = tile.y + dy;
      if (newX >= 0 && newX < 15 && newY >= 0 && newY < 15) {
        if (this.moveUnits(tile.x, tile.y, newX, newY)) {
          moved = true;
        }
      }
    }
    return moved;
  }

  moveUnits(fromX: number, fromY: number, toX: number, toY: number): boolean {
    const fromTile = this.map[fromY][fromX];
    const toTile = this.map[toY][toX];

    if (fromTile.owner !== this.currentPlayerIndex || fromTile.units <= 1) {
      return false;
    }

    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    if (dx + dy !== 1 || toTile.type === TileType.MOUNTAIN) {
      return false;
    }

    const movingUnits = fromTile.units - 1;
    fromTile.units = 1;

    if (toTile.owner === fromTile.owner) {
      toTile.units += movingUnits;
    } else if (toTile.owner === null) {
      toTile.owner = fromTile.owner;
      toTile.units = movingUnits;
    } else {
      if (movingUnits > toTile.units) {
        const remainingUnits = movingUnits - toTile.units;
        toTile.owner = fromTile.owner;
        toTile.units = remainingUnits;
        if (toTile.type === TileType.GENERAL) {
          this.captureGeneral(toTile.owner);
        }
      } else {
        toTile.units -= movingUnits;
      }
    }

    return true;
  }

  updateVisibility(): void {
    // Reset visibility
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        this.map[y][x].visible = false;
      }
    }

    // Update visibility for current player
    const playerTiles = this.getPlayerTiles(this.currentPlayerIndex);
    for (const tile of playerTiles) {
      this.setVisibleTiles(tile.x, tile.y);
    }
  }

  setVisibleTiles(x: number, y: number): void {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < 15 && newY >= 0 && newY < 15) {
          this.map[newY][newX].visible = true;
        }
      }
    }
  }

  checkWinCondition(): void {
    const alivePlayers = this.players.filter(player => 
      this.getPlayerTiles(player.id).some(tile => this.map[tile.y][tile.x].type === TileType.GENERAL)
    );

    if (alivePlayers.length === 1) {
      this.isRunning = false;
      console.log(`Player ${alivePlayers[0].name} wins!`);
    }
  }

  getPlayerTiles(playerId: number): { x: number, y: number }[] {
    const tiles: { x: number, y: number }[] = [];
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        if (this.map[y][x].owner === playerId) {
          tiles.push({ x, y });
        }
      }
    }
    return tiles;
  }

  captureGeneral(defeatedPlayerId: number): void {
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        const tile = this.map[y][x];
        if (tile.owner === defeatedPlayerId) {
          tile.owner = this.currentPlayerIndex;
          tile.units = Math.floor(tile.units / 2);
        }
      }
    }
  }

  restartGame() {
    this.startGame();
  }

// Add these methods to the Game class

addSoldiersToGeneralsAndCities(): void {
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      const tile = this.map[y][x];
      if (tile.owner !== null && (tile.type === TileType.GENERAL || tile.type === TileType.CITY)) {
        tile.units++;
      }
    }
  }
}

addSoldiersToAllTerritories(): void {
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      const tile = this.map[y][x];
      if (tile.owner !== null && tile.type !== TileType.MOUNTAIN) {
        tile.units++;
      }
    }
  }
}
  // Add a method to get a copy of the game state
  getState(): GameState {
    return {
      map: this.map,
      players: this.players,
      currentPlayerIndex: this.currentPlayerIndex,
      turn: this.turn,
      isRunning: this.isRunning,
      selectedTile: null // Initialize with null
    };
  }
}

// Add this interface to define the game state
export interface GameState {
  map: Tile[][];
  players: Player[];
  currentPlayerIndex: number;
  turn: number;
  isRunning: boolean;
  selectedTile: { x: number, y: number } | null;
}
