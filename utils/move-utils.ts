import { Board, Position } from "@/types/game";
import { isWithinBounds } from "./board-utils";

/**
 * Checks if a move is valid according to game rules
 * @param board Current game board
 * @param fromRow Starting row
 * @param fromCol Starting column
 * @param toRow Target row
 * @param toCol Target column
 * @returns True if the move is valid
 */
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

/**
 * Executes a move on the board
 * @param board Current game board
 * @param from Starting position [row, col]
 * @param to Target position [row, col]
 * @returns New board with the move executed
 */
export const executeMove = (
  board: Board,
  from: Position,
  to: Position,
): Board => {
  // Validate positions
  if (!Array.isArray(from) || from.length !== 2 || !Array.isArray(to) || to.length !== 2) {
    console.error("Invalid positions in executeMove:", { from, to });
    throw new Error("Invalid positions");
  }

  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  // Validate board and positions
  if (!board || !Array.isArray(board) || board.length === 0 ||
      !isWithinBounds(fromRow, fromCol) || !isWithinBounds(toRow, toCol)) {
    console.error("Invalid board or out of bounds positions:", { board, from, to });
    throw new Error("Invalid board or positions");
  }

  // Ensure there is a piece at the 'from' position
  if (!board[fromRow][fromCol]) {
    console.error("No piece at source position:", from);
    throw new Error("No piece at source position");
  }

  // Create a deep copy of the board
  const newBoard = JSON.parse(JSON.stringify(board));
  
  // Move the piece
  newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;
  
  return newBoard;
};
