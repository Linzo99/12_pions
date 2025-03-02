import { Board, BOARD_SIZE, Player, Position } from "@/types/game";

export const initializeBoard = (): Board => {
  const newBoard: Board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  // Place Player 1 (blue) pieces at the bottom
  for (let row = BOARD_SIZE - 1; row > BOARD_SIZE - 4; row--) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (
        row > BOARD_SIZE - 3 ||
        (row === BOARD_SIZE - 3 && col > BOARD_SIZE - 3)
      ) {
        newBoard[row][col] = { player: 1, type: "regular" };
      }
    }
  }

  // Place Player 2 (red) pieces at the top
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (row < 2 || (row === 2 && col < 2)) {
        newBoard[row][col] = { player: 2, type: "regular" };
      }
    }
  }

  return newBoard;
};

export const isWithinBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};

export const countPlayerPieces = (
  board: Board,
  player: Player,
): { count: number; lastPiece: Position | null } => {
  let count: number = 0;
  let lastPiece: Position | null = null;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col]?.player === player) {
        count++;
        lastPiece = [row, col];
      }
    }
  }
  return { count, lastPiece };
};

export const promotePiece = (board: Board, row: number, col: number): void => {
  const piece = board[row][col];
  if (!piece) return;

  const isLastRow =
    (piece.player === 1 && row === 0) ||
    (piece.player === 2 && row === BOARD_SIZE - 1);
  const { count: countA } = countPlayerPieces(board, piece.player);
  const { count: countB, lastPiece } = countPlayerPieces(
    board,
    piece.player == 1 ? 2 : 1,
  );

  if (piece.type === "regular" && (isLastRow || countA == 1)) {
    board[row][col] = { ...piece, type: "king" };
  }

  if (countB == 1 && lastPiece) {
    const [row, col] = lastPiece;
    const pieceB = board[row][col];
    if (pieceB?.type !== "regular") return;
    board[row][col] = { ...pieceB, type: "king" };
  }
};

export const createDeepCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
