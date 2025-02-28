"use client";

import { Board, Player, Position } from "@/types/game";
import {
  countPlayerPieces,
  executeMove,
  getAllPossibleMoves,
  getCaptureMoves,
  initializeBoard,
  isValidMove,
  minimax,
  promotePiece,
} from "@/utils";
import { createContext, useContext, useEffect, useReducer } from "react";

// Define the state type
export interface GameState {
  board: Board;
  currentPlayer: Player;
  playerId: Player;
  selectedPiece: Position | null;
  gameOver: Player | "draw" | null;
  mustCapture: boolean;
  sequentialCapture: boolean;
  isComputerEnabled: boolean;
  isThinking: boolean;
  isMultiplayer: boolean;
  onMoveEnd: (state: Partial<GameState>) => void;
}

// Define the initial state
export const initialState: GameState = {
  board: [],
  currentPlayer: 1,
  playerId: 1,
  selectedPiece: null,
  gameOver: null,
  mustCapture: false,
  sequentialCapture: false,
  isComputerEnabled: false,
  isThinking: false,
  isMultiplayer: false,
  onMoveEnd: () => null,
};

// Define action types
type GameAction =
  | { type: "INITIALIZE_BOARD" }
  | { type: "SELECT_PIECE"; position: Position | null }
  | { type: "MOVE_PIECE"; from: Position; to: Position; captures?: Position[] }
  | { type: "SET_MUST_CAPTURE"; value: boolean }
  | { type: "SET_SEQUENTIAL_CAPTURE"; value: boolean }
  | { type: "SWITCH_PLAYER" }
  | { type: "SET_GAME_OVER"; winner: Player | "draw" | null }
  | { type: "TOGGLE_COMPUTER"; value: boolean }
  | { type: "SET_MULTIPLAYER"; value: boolean }
  | { type: "SET_THINKING"; value: boolean }
  | { type: "RESET_GAME" }
  | { type: "SET_BOARD"; board: Board }
  | { type: "SET_CURRENT_PLAYER"; player: Player }
  | { type: "SET_STATE"; value: Partial<GameState> }
  | { type: "SET_ON_MOVE_END"; value: (state: Partial<GameState>) => void }
  | { type: "SET_PLAYER_ID"; value: Player };

// Create the reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_STATE":
      return {
        ...state,
        ...action.value,
      };
    case "INITIALIZE_BOARD":
      return {
        ...state,
        board: initializeBoard(),
        currentPlayer: 1,
      };
    case "SELECT_PIECE":
      return {
        ...state,
        selectedPiece: action.position,
      };
    case "MOVE_PIECE": {
      const newBoard = executeMove(state.board, action.from, action.to);
      // Handle captures if any
      const isCapturing = action.captures && action.captures.length > 0;
      if (isCapturing) {
        for (const capturePosition of action.captures!) {
          newBoard[capturePosition[0]][capturePosition[1]] = null;
        }
      }
      promotePiece(newBoard, action.to[0], action.to[1]);
      // use this to update board on multiplayer
      let newState;
      if (!isCapturing) {
        newState = {
          ...state,
          board: newBoard,
          selectedPiece: null,
          currentPlayer: (state.currentPlayer === 1 ? 2 : 1) as Player,
          mustCapture: false,
          sequentialCapture: false,
        };
      } else {
        // Check for additional captures (sequential captures)
        const additionalCaptures = getCaptureMoves(
          newBoard,
          action.to[0],
          action.to[1],
        );
        const hasMoreCaptures = additionalCaptures.length > 0;

        newState = {
          ...state,
          board: newBoard,
          selectedPiece: hasMoreCaptures
            ? ([action.to[0], action.to[1]] as Position)
            : null,
          mustCapture: hasMoreCaptures,
          sequentialCapture: hasMoreCaptures,
          currentPlayer: (hasMoreCaptures
            ? state.currentPlayer
            : state.currentPlayer === 1
              ? 2
              : 1) as Player,
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { playerId, ...toUpdate } = newState;
      state.onMoveEnd(toUpdate);
      return newState;
    }
    case "SET_MUST_CAPTURE":
      return {
        ...state,
        mustCapture: action.value,
      };
    case "SET_SEQUENTIAL_CAPTURE":
      return {
        ...state,
        sequentialCapture: action.value,
      };
    case "SWITCH_PLAYER":
      return {
        ...state,
        currentPlayer: state.currentPlayer === 1 ? 2 : 1,
      };
    case "SET_GAME_OVER":
      return {
        ...state,
        gameOver: action.winner,
      };
    case "TOGGLE_COMPUTER":
      return {
        ...state,
        isComputerEnabled: action.value,
      };
    case "SET_THINKING":
      return {
        ...state,
        isThinking: action.value,
      };
    case "RESET_GAME":
      if (state.isMultiplayer) {
        state.onMoveEnd({ gameOver: null, board: initializeBoard() });
        return {
          ...state,
          board: initializeBoard(),
        };
      }
      return {
        ...initialState,
        board: initializeBoard(),
      };
    case "SET_BOARD":
      return {
        ...state,
        board: action.board,
      };
    case "SET_CURRENT_PLAYER":
      return {
        ...state,
        currentPlayer: action.player,
      };
    case "SET_PLAYER_ID":
      return {
        ...state,
        playerId: action.value,
      };
    case "SET_MULTIPLAYER":
      return {
        ...state,
        isComputerEnabled: false,
        isMultiplayer: action.value,
      };
    case "SET_ON_MOVE_END":
      return {
        ...state,
        onMoveEnd: action.value,
      };
    default:
      return state;
  }
}

// Create the context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  checkForCaptures: (playerNumber: Player) => boolean;
  handleCellClick: (row: number, col: number) => void;
  makeComputerMove: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Create the provider component
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Initialize the board on mount
  useEffect(() => {
    dispatch({ type: "INITIALIZE_BOARD" });
  }, []);

  // Check for game over
  useEffect(() => {
    if (state.board.length === 0) return;

    const player1Pieces = countPlayerPieces(state.board, 1);
    const player2Pieces = countPlayerPieces(state.board, 2);

    if (player1Pieces === 0) {
      dispatch({ type: "SET_GAME_OVER", winner: 2 });
    } else if (player2Pieces === 0) {
      dispatch({ type: "SET_GAME_OVER", winner: 1 });
    } else if (
      player1Pieces === 1 &&
      player2Pieces === 1 &&
      !state.sequentialCapture
    ) {
      dispatch({ type: "SET_GAME_OVER", winner: "draw" });
    }
  }, [state.board]);

  // Check for forced captures
  useEffect(() => {
    if (state.board.length === 0) return;
    dispatch({
      type: "SET_MUST_CAPTURE",
      value: checkForCaptures(state.currentPlayer),
    });
  }, [
    state.board,
    state.currentPlayer,
    state.selectedPiece,
    state.sequentialCapture,
  ]);

  // Computer move effect
  useEffect(() => {
    if (
      state.isComputerEnabled &&
      state.currentPlayer === 2 &&
      !state.gameOver &&
      !state.isMultiplayer // Don't trigger AI moves in multiplayer
    ) {
      setTimeout(makeComputerMove, 500);
    }
  }, [
    state.isComputerEnabled,
    state.currentPlayer,
    state.gameOver,
    state.sequentialCapture,
    state.isMultiplayer, // Add isMultiplayer to dependencies
  ]);

  // Check for captures
  const checkForCaptures = (playerNumber: Player): boolean => {
    for (let row = 0; row < state.board.length; row++) {
      for (let col = 0; col < state.board[row].length; col++) {
        const piece = state.board[row][col];
        if (piece && piece.player === playerNumber) {
          const captureMoves = getCaptureMoves(state.board, row, col);
          if (captureMoves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Handle computer move
  const makeComputerMove = async () => {
    if (
      !state.isComputerEnabled ||
      state.currentPlayer !== 2 ||
      state.gameOver ||
      state.board.length === 0 ||
      state.isMultiplayer // Don't allow computer moves in multiplayer
    ) {
      return;
    }

    try {
      dispatch({ type: "SET_THINKING", value: true });
      // Get all possible moves
      const allMoves = getAllPossibleMoves(state.board, 2);
      const result = minimax(
        state.board,
        4,
        -Infinity,
        Infinity,
        true,
        2, // currentPlayer is 2 (computer)
        2, // maximizingPlayer is 2 (computer)
      );
      if (result.move) {
        const { from, to, captures } = result.move;
        dispatch({
          type: "MOVE_PIECE",
          from,
          to,
          captures,
        });
      } else if (allMoves.length === 0) {
        dispatch({ type: "SET_GAME_OVER", winner: 1 });
      }
    } catch (error) {
      console.error("Computer move error:", error);
    } finally {
      dispatch({ type: "SET_THINKING", value: false });
    }
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (state.gameOver) return;
    if (state.isComputerEnabled && state.currentPlayer == 2) return;
    if (state.isMultiplayer && state.playerId !== state.currentPlayer) return;

    const clickedCell = state.board[row][col];

    // If we're in a sequential capture, only allow clicking on valid capture destinations
    if (state.sequentialCapture) {
      if (state.selectedPiece) {
        const [fromRow, fromCol] = state.selectedPiece;
        const captureMoves = getCaptureMoves(state.board, fromRow, fromCol);

        const captureMove = captureMoves.find(
          (move) =>
            move.finalPosition[0] === row && move.finalPosition[1] === col,
        );

        if (captureMove) {
          dispatch({
            type: "MOVE_PIECE",
            from: [fromRow, fromCol],
            to: captureMove.finalPosition,
            captures: captureMove.capturedPositions,
          });
        }
        return;
      }
      return;
    }

    // If a piece is already selected
    if (state.selectedPiece) {
      const [fromRow, fromCol] = state.selectedPiece;
      // If clicking on another piece of the same player, select that piece instead
      if (clickedCell && clickedCell.player === state.currentPlayer) {
        // If there are mandatory captures, only allow selecting pieces that can capture
        if (state.mustCapture) {
          const captures = getCaptureMoves(state.board, row, col);
          if (captures.length > 0) {
            dispatch({ type: "SELECT_PIECE", position: [row, col] });
          }
        } else {
          dispatch({ type: "SELECT_PIECE", position: [row, col] });
        }
        return;
      }

      // If clicking on an empty cell or opponent's piece
      if (!clickedCell || clickedCell.player !== state.currentPlayer) {
        // Check for forced captures
        if (state.mustCapture) {
          const captureMoves = getCaptureMoves(state.board, fromRow, fromCol);
          const captureMove = captureMoves.find(
            (move) =>
              move.finalPosition[0] === row && move.finalPosition[1] === col,
          );

          if (captureMove) {
            dispatch({
              type: "MOVE_PIECE",
              from: [fromRow, fromCol],
              to: captureMove.finalPosition,
              captures: captureMove.capturedPositions,
            });
          } else {
            // If clicking on an invalid destination during mandatory capture
            // Just keep the piece selected
            return;
          }
        } else if (isValidMove(state.board, fromRow, fromCol, row, col)) {
          // Regular move
          dispatch({
            type: "MOVE_PIECE",
            from: [fromRow, fromCol],
            to: [row, col],
          });
        } else {
          // Invalid move, deselect the piece
          dispatch({ type: "SELECT_PIECE", position: null });
        }
      }
    } else if (clickedCell?.player === state.currentPlayer) {
      // Select a new piece
      if (state.mustCapture) {
        const captures = getCaptureMoves(state.board, row, col);
        if (captures.length > 0) {
          dispatch({ type: "SELECT_PIECE", position: [row, col] });
        }
      } else {
        dispatch({ type: "SELECT_PIECE", position: [row, col] });
      }
    }
  };

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        checkForCaptures,
        handleCellClick,
        makeComputerMove,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// Create a custom hook to use the context
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
