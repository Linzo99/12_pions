import {
  Board,
  Cell,
  Direction,
  ORTHOGONAL_DIRECTIONS,
  Position,
} from "@/types/game";
import { isWithinBounds } from "./board-utils";

/**
 * Represents a capture move with the final position and captured pieces
 */
export interface CaptureMove {
  finalPosition: Position;
  capturedPositions: Position[];
}

/**
 * Checks if a capture move is valid
 * @param board Current game board
 * @param piece The piece making the capture
 * @param fromRow Starting row
 * @param fromCol Starting column
 * @param jumpRow Landing row after the capture
 * @param jumpCol Landing column after the capture
 * @param adjacentRow Row of the piece to be captured
 * @param adjacentCol Column of the piece to be captured
 * @returns True if the capture is valid
 */
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
      (piece.player === 1 && jumpRow > fromRow) || // Forward for player 1
      (piece.player === 2 && jumpRow < fromRow) || // Forward for player 2
      jumpRow === fromRow; // Horizontal for both players

    return (validDirection && isEnemy && landingEmpty) as boolean;
  }

  return (isEnemy && landingEmpty) as boolean;
};

/**
 * Gets all possible capture moves for a piece
 * @param board Current game board
 * @param row Row of the piece
 * @param col Column of the piece
 * @returns Array of possible capture moves
 */
export const getCaptureMoves = (
  board: Board,
  row: number,
  col: number,
): CaptureMove[] => {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: CaptureMove[] = [];
  const visited = new Set<string>();

  /**
   * Recursively finds all possible capture sequences
   * @param currentRow Current row in the sequence
   * @param currentCol Current column in the sequence
   * @param capturedPositions Positions captured so far
   */
  const findCaptures = (
    currentRow: number,
    currentCol: number,
    capturedPositions: Position[] = [],
  ) => {
    const currentKey = `${currentRow},${currentCol}`;
    if (visited.has(currentKey)) return;
    visited.add(currentKey);

    const possibleCaptures = ORTHOGONAL_DIRECTIONS.flatMap((dir) => {
      if (piece.type === "king") {
        return getKingCaptures(board, currentRow, currentCol, dir);
      }
      return getRegularCaptures(board, currentRow, currentCol, dir);
    }).filter(([r, c]) => isWithinBounds(r, c));

    if (possibleCaptures.length === 0 && capturedPositions.length > 0) {
      // End of capture sequence
      moves.push({
        finalPosition: [currentRow, currentCol],
        capturedPositions: [...capturedPositions],
      });
      return;
    }

    for (const [jumpRow, jumpCol, capturePos] of possibleCaptures) {
      const tempBoard = board.map((row) => [...row]);
      tempBoard[capturePos[0]][capturePos[1]] = null;
      tempBoard[currentRow][currentCol] = null;
      tempBoard[jumpRow][jumpCol] = piece;

      findCaptures(jumpRow, jumpCol, [...capturedPositions, capturePos]);
    }
  };

  findCaptures(row, col);
  return moves;
};

/**
 * Gets possible capture moves for a regular piece in a specific direction
 * @param board Current game board
 * @param row Row of the piece
 * @param col Column of the piece
 * @param dir Direction to check
 * @returns Array of possible capture positions with the captured piece
 */
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
    isWithinBounds(adjacentRow, adjacentCol) &&
    isWithinBounds(jumpRow, jumpCol)
  ) {
    const adjacentPiece = board[adjacentRow][adjacentCol];
    if (
      adjacentPiece &&
      adjacentPiece.player !== piece.player &&
      board[jumpRow][jumpCol] === null
    ) {
      // For regular pieces, check direction constraints
      if (piece.type === "regular") {
        const validDirection =
          (piece.player === 1 && jumpRow > row) || // Forward for player 1
          (piece.player === 2 && jumpRow < row) || // Forward for player 2
          jumpRow === row; // Horizontal for both players

        if (validDirection) {
          return [[jumpRow, jumpCol, [adjacentRow, adjacentCol]]];
        }
      } else {
        // Kings can capture in any orthogonal direction
        return [[jumpRow, jumpCol, [adjacentRow, adjacentCol]]];
      }
    }
  }

  return [];
};

/**
 * Gets possible capture moves for a king piece in a specific direction
 * @param board Current game board
 * @param row Row of the piece
 * @param col Column of the piece
 * @param dir Direction to check
 * @returns Array of possible capture positions with the captured piece
 */
export const getKingCaptures = (
  board: Board,
  row: number,
  col: number,
  dir: Direction,
): [number, number, Position][] => {
  const piece = board[row][col];
  if (!piece || piece.type !== "king") return [];

  const captures: [number, number, Position][] = [];
  let currentRow = row + dir.row;
  let currentCol = col + dir.col;
  let foundEnemy = false;
  let enemyPosition: Position | null = null;

  // Look for an enemy piece in the direction
  while (isWithinBounds(currentRow, currentCol)) {
    const currentPiece = board[currentRow][currentCol];
    if (currentPiece) {
      if (currentPiece.player !== piece.player && !foundEnemy) {
        foundEnemy = true;
        enemyPosition = [currentRow, currentCol];
      } else {
        // Found a second piece (either enemy or friendly), stop searching
        break;
      }
    }
    
    // If we found an enemy and now found an empty space, this is a valid capture
    if (foundEnemy && currentPiece === null) {
      captures.push([currentRow, currentCol, enemyPosition as Position]);
      break;
    }
    
    currentRow += dir.row;
    currentCol += dir.col;
  }

  return captures;
};

/**
 * Gets all regular (non-capture) moves for a piece
 * @param board Current game board
 * @param row Row of the piece
 * @param col Column of the piece
 * @returns Array of possible move positions
 */
export const getRegularMoves = (
  board: Board,
  row: number,
  col: number,
): Position[] => {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: Position[] = [];

  if (piece.type === "regular") {
    // Regular pieces can move one space orthogonally
    for (const dir of ORTHOGONAL_DIRECTIONS) {
      const newRow = row + dir.row;
      const newCol = col + dir.col;

      // Regular pieces can only move forward or sideways
      const isForwardOrSideways =
        (piece.player === 1 && (dir.row === 1 || dir.row === 0)) ||
        (piece.player === 2 && (dir.row === -1 || dir.row === 0));

      if (
        isWithinBounds(newRow, newCol) &&
        board[newRow][newCol] === null &&
        isForwardOrSideways
      ) {
        moves.push([newRow, newCol]);
      }
    }
  } else {
    // Kings can move multiple spaces in any orthogonal direction
    for (const dir of ORTHOGONAL_DIRECTIONS) {
      let newRow = row + dir.row;
      let newCol = col + dir.col;

      while (isWithinBounds(newRow, newCol) && board[newRow][newCol] === null) {
        moves.push([newRow, newCol]);
        newRow += dir.row;
        newCol += dir.col;
      }
    }
  }

  return moves;
};
