import { Board, Move, Player, Position } from "@/types/game";
import { promotePiece } from "./board-utils";
import { getCaptureMoves } from "./capture-utils";
import { isValidMove } from "./move-utils";

const evaluateBoard = (board: Board, maximizingPlayer: Player): number => {
  let score = 0;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceValue = piece.type === "king" ? 3 : 1;
        if (piece.player === maximizingPlayer) {
          score += pieceValue;
          // Add positional bonus for regular pieces moving forward
          if (piece.type === "regular") {
            // Player 1 moves up (decreasing row values is good, starting from bottom row=4)
            // Player 2 moves down (increasing row values is good, starting from top row=0)
            if (maximizingPlayer === 1) {
              // For Player 1: reward being closer to the top (row 0)
              score += (board.length - 1 - row) * 0.1;
            } else {
              // For Player 2: reward being closer to the bottom (row 4)
              score += row * 0.1;
            }
          }
        } else {
          score -= pieceValue;
          if (piece.type === "regular") {
            // For opponent's pieces, reverse the positional bonuses
            if (maximizingPlayer === 1) {
              // When maximizing for Player 1, opponent's pieces are worse when closer to bottom
              score -= row * 0.1;
            } else {
              // When maximizing for Player 2, opponent's pieces are worse when closer to top
              score -= (board.length - 1 - row) * 0.1;
            }
          }
        }
      }
    }
  }
  return score;
};

export const minimax = (
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  currentPlayer: Player,
  maximizingPlayer: Player,
): { score: number; move?: Move } => {
  if (depth === 0) {
    return { score: evaluateBoard(board, maximizingPlayer) };
  }

  // Get all legal moves (this will only include captures if any are available)
  const moves = getAllPossibleMoves(board, currentPlayer);

  if (moves.length === 0) {
    // If no moves available, this is a loss for the current player
    return {
      score: isMaximizing ? -1000 : 1000,
    };
  }

  let bestMove: Move | undefined;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  // Prioritize moves with captures and promotions
  const prioritizedMoves = moves
    .map((move) => {
      let priority = 0;

      // Check if this move captures a king
      if (move.captures && move.captures.length > 0) {
        for (const [captureRow, captureCol] of move.captures) {
          const capturedPiece = board[captureRow][captureCol];
          if (capturedPiece && capturedPiece.type === "king") {
            priority += 20; // Highest priority for capturing kings
          } else {
            priority += 10; // High priority for any capture
          }
        }
      }

      // Check if this move leads to promotion
      const [fromRow, fromCol] = move.from;
      const [toRow] = move.to;
      const movingPiece = board[fromRow][fromCol];

      if (movingPiece && movingPiece.type === "regular") {
        // Player 1 promotes at top row (0), Player 2 at bottom row (board.length - 1)
        if (
          (currentPlayer === 1 && toRow === 0) ||
          (currentPlayer === 2 && toRow === board.length - 1)
        ) {
          priority += 15; // High priority for promotion
        }
      }

      return { ...move, priority };
    })
    .sort((a, b) => b.priority - a.priority);

  for (const move of prioritizedMoves) {
    // Create a deep copy of the board
    const newBoard = JSON.parse(JSON.stringify(board));

    // Execute the move
    newBoard[move.to[0]][move.to[1]] = newBoard[move.from[0]][move.from[1]];
    newBoard[move.from[0]][move.from[1]] = null;

    // Handle captures
    if (move.captures && move.captures.length > 0) {
      for (const capturePos of move.captures) {
        newBoard[capturePos[0]][capturePos[1]] = null;
      }
    }

    // Handle promotion
    promotePiece(newBoard, move.to[0], move.to[1]);

    // Check for additional captures (sequential)
    const additionalCaptures = getCaptureMoves(
      newBoard,
      move.to[0],
      move.to[1],
    );

    // If there are additional captures, continue with the same player
    const nextPlayer =
      additionalCaptures.length > 0
        ? currentPlayer
        : currentPlayer === 1
          ? 2
          : 1;

    const result = minimax(
      newBoard,
      depth - 1,
      alpha,
      beta,
      !isMaximizing,
      nextPlayer,
      maximizingPlayer,
    );

    if (isMaximizing) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
    }

    if (beta <= alpha) {
      break;
    }
  }

  return { score: bestScore, move: bestMove };
};

// Updated getAllPossibleMoves with complete capture handling
export const getAllPossibleMoves = (board: Board, player: number): Move[] => {
  const moves: Move[] = [];
  const captureMovesExist = hasCaptureMove(board, player);

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const piece = board[row][col];
      if (!piece || piece.player !== player) continue;

      // Get captures first
      const captures = getCaptureMoves(board, row, col);
      const cap_w_scores = captures.map((cap) => ({
        from: [row, col] as Position,
        to: cap.finalPosition,
        captures: cap.capturedPositions,
        score: 1 * captures.length,
      }));

      moves.push(...cap_w_scores);

      // Get regular moves ONLY if no captures found anywhere on the board
      if (!captureMovesExist && captures.length === 0) {
        for (let toRow = 0; toRow < 5; toRow++) {
          for (let toCol = 0; toCol < 5; toCol++) {
            if (isValidMove(board, row, col, toRow, toCol)) {
              moves.push({
                from: [row, col],
                to: [toRow, toCol],
                captures: [],
                score: 0,
              });
            }
          }
        }
      }
    }
  }

  // Prioritize moves with captures
  return moves.sort((a, b) => b.score - a.score);
};

// Helper function to check if any capture moves exist for the player
const hasCaptureMove = (board: Board, player: number): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const captures = getCaptureMoves(board, row, col);
        if (captures.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
};
