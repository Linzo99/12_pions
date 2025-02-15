import { Board, BOARD_SIZE, Player } from "@/types/game";

export const initializeBoard = (): Board => {
  const newBoard: Board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  // Place Player 1 (blue) pieces
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (row < 2 || (row === 2 && col < 2)) {
        newBoard[row][col] = { player: 1, type: "regular" };
      }
    }
  }

  // Place Player 2 (red) pieces
  for (let row = BOARD_SIZE - 1; row > BOARD_SIZE - 4; row--) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (
        row > BOARD_SIZE - 3 ||
        (row === BOARD_SIZE - 3 && col > BOARD_SIZE - 3)
      ) {
        newBoard[row][col] = { player: 2, type: "regular" };
      }
    }
  }

  return newBoard;
};

export const isWithinBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};

export const countPlayerPieces = (board: Board, player: Player): number => {
  let count = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col]?.player === player) {
        count++;
      }
    }
  }
  return count;
};

export const promotePiece = (board: Board, row: number, col: number): void => {
  const piece = board[row][col];
  if (!piece) return;

  const isLastRow =
    (piece.player === 1 && row === BOARD_SIZE - 1) ||
    (piece.player === 2 && row === 0);
  const isLastPiece = countPlayerPieces(board, piece.player) === 1;

  if (piece.type === "regular" && (isLastRow || isLastPiece)) {
    board[row][col] = { ...piece, type: "king" };
  }
};
