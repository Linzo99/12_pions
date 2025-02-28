import { Board, Move, Player, Position } from "@/types/game";
import { getCaptureMoves } from "./capture-utils";
import { isValidMove } from "./move-utils";

// Evaluation scores
const PIECE_VALUE = 10;
const CAPTURE_VALUE = 20;
const POSITION_VALUE = 1;
const CENTER_BONUS = 2;

// Function to get all valid moves for a piece
function getValidMoves(board: Board, row: number, col: number): Position[] {
  const validMoves: Position[] = [];
  const piece = board[row][col];
  
  if (!piece) return [];
  
  // Check all possible directions (up, down, left, right, diagonals)
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1], // orthogonal
    [-1, -1], [-1, 1], [1, -1], [1, 1] // diagonal
  ];
  
  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    // Check if the move is valid
    if (isValidMove(board, row, col, newRow, newCol)) {
      validMoves.push([newRow, newCol]);
    }
  }
  
  return validMoves;
}

// Get all possible moves for a player
export function getAllPossibleMoves(board: Board, player: Player): Move[] {
  const moves: Move[] = [];
  const captureMoves: Move[] = [];

  // Check each piece on the board
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const piece = board[i][j];
      if (piece && piece.player === player) {
        // Check for capture moves first
        const captures = getCaptureMoves(board, i, j);
        if (captures.length > 0) {
          for (const capture of captures) {
            captureMoves.push({
              from: [i, j],
              to: capture.finalPosition,
              captures: capture.capturedPositions,
              score: 0,
              isCapture: true,
            });
          }
        }
        
        // If no captures are available, check regular moves
        if (captureMoves.length === 0) {
          const validMoves = getValidMoves(board, i, j);
          for (const move of validMoves) {
            moves.push({
              from: [i, j],
              to: move,
              captures: [],
              score: 0,
              isCapture: false,
            });
          }
        }
      }
    }
  }

  // If there are capture moves, only return those (captures are mandatory)
  return captureMoves.length > 0 ? captureMoves : moves;
}

// Find the best move for the AI player using minimax algorithm
export function findBestMove(
  board: Board,
  player: Player,
  depth: number = 3,
): Move | null {
  const moves = getAllPossibleMoves(board, player);
  if (moves.length === 0) return null;

  let bestScore = -Infinity;
  let bestMove = null;

  for (const move of moves) {
    // Apply the move to a new board
    const newBoard = applyMove(board, move);

    // Evaluate using minimax
    const score = minimax(
      newBoard,
      depth - 1,
      false,
      player === 1 ? 2 : 1,
      player,
      -Infinity,
      Infinity,
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// Minimax algorithm with alpha-beta pruning
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  currentPlayer: Player,
  aiPlayer: Player,
  alpha: number,
  beta: number,
): number {
  // Base case: if we've reached the maximum depth or game is over
  if (depth === 0) {
    return evaluateBoard(board, aiPlayer);
  }

  const moves = getAllPossibleMoves(board, currentPlayer);
  if (moves.length === 0) {
    return isMaximizing ? -1000 : 1000; // Game over, no moves available
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move);
      const score = minimax(
        newBoard,
        depth - 1,
        false,
        currentPlayer === 1 ? 2 : 1,
        aiPlayer,
        alpha,
        beta,
      );
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move);
      const score = minimax(
        newBoard,
        depth - 1,
        true,
        currentPlayer === 1 ? 2 : 1,
        aiPlayer,
        alpha,
        beta,
      );
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minScore;
  }
}

// Apply a move to the board and return the new board state
function applyMove(board: Board, move: Move): Board {
  const newBoard: Board = JSON.parse(JSON.stringify(board));
  const [fromRow, fromCol] = move.from;
  const [toRow, toCol] = move.to;

  // Move the piece
  newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;

  // Handle captures
  if (move.captures && move.captures.length > 0) {
    for (const [captureRow, captureCol] of move.captures) {
      newBoard[captureRow][captureCol] = null;
    }
  }

  return newBoard;
}

// Evaluate the board state for the specified player
export function evaluateBoard(board: Board, player: Player): number {
  let score = 0;
  const opponent = player === 1 ? 2 : 1;

  // Count pieces and evaluate their positions
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const piece = board[i][j];
      if (piece) {
        if (piece.player === player) {
          score += PIECE_VALUE;

          // Add position-based evaluation
          score += POSITION_VALUE;

          // Bonus for controlling the center
          if (i >= 1 && i <= 4 && j >= 1 && j <= 4) {
            score += CENTER_BONUS;
          }
        } else {
          score -= PIECE_VALUE;
        }
      }
    }
  }

  // Evaluate capture opportunities
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const piece = board[i][j];
      if (piece && piece.player === player) {
        const captures = getCaptureMoves(board, i, j);
        score += captures.length * CAPTURE_VALUE;
      } else if (piece && piece.player === opponent) {
        const captures = getCaptureMoves(board, i, j);
        score -= captures.length * CAPTURE_VALUE;
      }
    }
  }

  return score;
}
