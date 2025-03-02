import {
  Board,
  Cell,
  Direction,
  ORTHOGONAL_DIRECTIONS,
  Position,
} from "@/types/game";
import { isWithinBounds } from "./board-utils";

export interface CaptureMove {
  finalPosition: Position;
  capturedPositions: Position[];
}

export const isValidCapture = (
  board: Board,
  piece: NonNullable<Cell>,
  fromRow: number,
  fromCol: number,
  jumpRow: number,
  jumpCol: number,
  adjacentRow: number,
  adjacentCol: number,
): boolean => {
  if (!isWithinBounds(jumpRow, jumpCol)) return false;

  const adjacentPiece = board[adjacentRow][adjacentCol];
  const isEnemy = adjacentPiece && adjacentPiece.player !== piece.player;
  const landingEmpty = board[jumpRow][jumpCol] === null;

  if (piece.type === "regular") {
    const validDirection =
      (piece.player === 1 && jumpRow < fromRow) || // Forward for player 1 (now upward)
      (piece.player === 2 && jumpRow > fromRow) || // Forward for player 2 (now downward)
      jumpRow === fromRow; // Horizontal for both players

    return (validDirection && isEnemy && landingEmpty) as boolean;
  }

  return (isEnemy && landingEmpty) as boolean;
};

export const getCaptureMoves = (
  board: Board,
  row: number,
  col: number,
): CaptureMove[] => {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: CaptureMove[] = [];
  const possibleCaptures = ORTHOGONAL_DIRECTIONS.flatMap((dir) => {
    if (piece.type === "king") {
      return getKingCaptures(board, row, col, dir);
    }
    return getRegularCaptures(board, row, col, dir);
  }).filter(([r, c]) => isWithinBounds(r, c));
  possibleCaptures.map(([jumpRow, jumpCol, capture]) => {
    moves.push({
      finalPosition: [jumpRow, jumpCol],
      capturedPositions: [capture],
    });
  });

  return moves;
};

export const getRegularCaptures = (
  board: Board,
  row: number,
  col: number,
  dir: Direction,
): [number, number, Position][] => {
  const piece = board[row][col];
  if (!piece) return [];

  const adjacentRow = row + dir.row;
  const adjacentCol = col + dir.col;
  const jumpRow = adjacentRow + dir.row;
  const jumpCol = adjacentCol + dir.col;

  if (
    isValidCapture(
      board,
      piece,
      row,
      col,
      jumpRow,
      jumpCol,
      adjacentRow,
      adjacentCol,
    )
  ) {
    return [[jumpRow, jumpCol, [adjacentRow, adjacentCol]]];
  }
  return [];
};

export const getKingCaptures = (
  board: Board,
  row: number,
  col: number,
  dir: Direction,
): [number, number, Position][] => {
  const piece = board[row][col];
  if (!piece || piece.type !== "king") return [];

  const captures: [number, number, Position][] = [];
  let currentRow = row;
  let currentCol = col;
  let enemyPosition: Position | null = null;

  while (true) {
    currentRow += dir.row;
    currentCol += dir.col;

    if (!isWithinBounds(currentRow, currentCol)) break;

    const currentPiece = board[currentRow][currentCol];
    if (!currentPiece) continue;

    if (currentPiece.player === piece.player) break;

    // Found an enemy piece
    enemyPosition = [currentRow, currentCol];

    // Look for landing squares after the enemy piece
    let landingRow = currentRow + dir.row;
    let landingCol = currentCol + dir.col;

    while (isWithinBounds(landingRow, landingCol)) {
      if (board[landingRow][landingCol] !== null) break;
      captures.push([landingRow, landingCol, enemyPosition]);
      landingRow += dir.row;
      landingCol += dir.col;
    }

    break;
  }

  return captures;
};

export const getRegularMoves = (
  board: Board,
  row: number,
  col: number,
): Position[] => {
  const piece = board[row][col];
  if (!piece) return [];

  return ORTHOGONAL_DIRECTIONS.flatMap((dir) => {
    const newRow = row + dir.row;
    const newCol = col + dir.col;

    if (!isWithinBounds(newRow, newCol)) return [];
    if (board[newRow][newCol] !== null) return [];

    if (piece.type === "regular") {
      const validDirection =
        (piece.player === 1 && newRow < row) || // Forward for player 1
        (piece.player === 2 && newRow > row) || // Forward for player 2
        newRow === row; // Horizontal for both players

      return validDirection ? [[newRow, newCol]] : [];
    }

    return [[newRow, newCol]];
  });
};
