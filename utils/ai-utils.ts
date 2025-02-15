import { Board, Move, Player, Position } from "@/types/game";
import { promotePiece } from "./board-utils";
import { getCaptureMoves } from "./capture-utils";
import { executeMove, isValidMove } from "./move-utils";

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
            score += maximizingPlayer === 1 ? row * 0.1 : (7 - row) * 0.1;
          }
        } else {
          score -= pieceValue;
          if (piece.type === "regular") {
            score -= maximizingPlayer === 1 ? (7 - row) * 0.1 : row * 0.1;
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

  const moves = getAllPossibleMoves(board, currentPlayer);

  // Debug: Log moves at root level
  if (depth === 4) {
    console.log("Root level moves:", moves);
  }

  if (moves.length === 0) {
    // If no moves available, this is a loss for the current player
    return {
      score: isMaximizing ? -1000 : 1000,
    };
  }

  let bestMove: Move | undefined;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of moves) {
    const newBoard = executeMove(board, move.from, move.to);
    for (const capture of move.captures) {
      newBoard[capture[0]][capture[1]] = null;
    }
    promotePiece(newBoard, move.to[0], move.to[1]);

    const result = minimax(
      newBoard,
      depth - 1,
      alpha,
      beta,
      !isMaximizing,
      currentPlayer === 1 ? 2 : 1,
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

      // Get regular moves if no captures found
      if (captures.length === 0) {
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
