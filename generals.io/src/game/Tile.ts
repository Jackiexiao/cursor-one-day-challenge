export enum TileType {
  EMPTY,
  MOUNTAIN,
  CITY,
  GENERAL
}

export class Tile {
  constructor(
    public type: TileType,
    public units: number = 0,
    public owner: number | null = null,
    public visible: boolean = false
  ) {}
}