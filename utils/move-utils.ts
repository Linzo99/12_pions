import { Board, Position } from "../types/game";
import { isWithinBounds } from "./board-utils";

export const isValidMove = (
  board: Board,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean => {
  if (!isWithinBounds(fromRow, fromCol) || !isWithinBounds(toRow, toCol)) {
    return false;
  }

  const piece = board[fromRow][fromCol];
  if (!piece || board[toRow][toCol] !== null) return false;

  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  // Regular piece movement
  if (piece.type === "regular") {
    const forward = piece.player === 1 ? 1 : -1;
    return (
      (rowDiff === forward && colDiff === 0) || // Forward
      (rowDiff === 0 && Math.abs(colDiff) === 1) // Sideways
    );
  }

  // King movement
  if (piece.type === "king") {
    if (rowDiff !== 0 && colDiff !== 0) return false; // Diagonal not allowed

    const rowStep = Math.sign(rowDiff);
    const colStep = Math.sign(colDiff);
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (
        !isWithinBounds(currentRow, currentCol) ||
        board[currentRow][currentCol]
      ) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    return true;
  }

  return false;
};

export const executeMove = (
  board: Board,
  from: Position,
  to: Position,
): Board => {
  const newBoard = board.map((row) => [...row]);
  newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
  newBoard[from[0]][from[1]] = null;
  return newBoard;
};
