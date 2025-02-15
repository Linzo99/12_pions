export type Player = 1 | 2;
export type PieceType = "regular" | "king";
export type Cell = null | { player: Player; type: PieceType };
export type Board = Cell[][];
export type Position = [number, number];
export type Move = {
  from: Position;
  to: Position;
  captures: Position[];
  score: number;
};

export type Direction = {
  row: number;
  col: number;
};

export const BOARD_SIZE = 5;
export const ORTHOGONAL_DIRECTIONS: Direction[] = [
  { row: -1, col: 0 }, // Up
  { row: 1, col: 0 }, // Down
  { row: 0, col: -1 }, // Left
  { row: 0, col: 1 }, // Right
];
