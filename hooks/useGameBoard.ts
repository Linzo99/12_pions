"use client";

import { useGame } from "@/context/GameContext";
import { getCaptureMoves, isValidMove } from "@/utils";

export function useGameBoard() {
  // Always call hooks at the top level
  const { state, handleCellClick } = useGame();

  // Determine if a cell is selected
  const isCellSelected = (row: number, col: number): boolean => {
    return !!(
      state.selectedPiece &&
      state.selectedPiece[0] === row &&
      state.selectedPiece[1] === col
    );
  };

  // Determine if a cell is a valid move target
  const isValidMoveTarget = (row: number, col: number): boolean => {
    if (!state.selectedPiece) return false;

    return isValidMove(
      state.board,
      state.selectedPiece[0],
      state.selectedPiece[1],
      row,
      col,
    );
  };

  // Determine if a cell is a valid capture target
  const isValidCaptureTarget = (row: number, col: number): boolean => {
    if (!state.selectedPiece) return false;

    return getCaptureMoves(
      state.board,
      state.selectedPiece[0],
      state.selectedPiece[1],
    ).some(
      (move) => move.finalPosition[0] === row && move.finalPosition[1] === col,
    );
  };

  // Get cell style classes
  const getCellClasses = (row: number, col: number): string => {
    const isSelected = isCellSelected(row, col);
    const isValidMove = isValidMoveTarget(row, col);
    const isValidCapture = isValidCaptureTarget(row, col);
    const isHighlighted = isSelected || isValidMove || isValidCapture;

    return `w-32 h-32 ${
      (row + col) % 2 === 0 ? "bg-amber-100" : "bg-amber-800"
    } ${
      isHighlighted ? "ring-4 ring-yellow-400 ring-inset" : ""
    } relative cursor-pointer transition-all duration-150 hover:brightness-110`;
  };

  // Get the CSS classes for the piece based on player and king status
  const getPieceClasses = (player: 1 | 2, isKing: boolean): string => {
    return `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
      w-[70%] h-[70%] rounded-full 
      ${
        player === 1
          ? "bg-gradient-to-br from-blue-400 to-blue-600"
          : "bg-gradient-to-br from-red-400 to-red-600"
      } 
      ${
        isKing
          ? "border-[8px] border-yellow-400 shadow-lg"
          : "border-4 border-black/10"
      }
      shadow-md
      transition-all duration-300 ease-out
      hover:scale-105 hover:shadow-lg`;
  };

  // Get cell coordinates (e.g., A1, B2)
  const getCellCoordinates = (row: number, col: number): string => {
    return `${String.fromCharCode(65 + col)}${row + 1}`;
  };

  return {
    board: state.board,
    currentPlayer: state.currentPlayer,
    gameOver: state.gameOver,
    mustCapture: state.mustCapture,
    sequentialCapture: state.sequentialCapture,
    isComputerEnabled: state.isComputerEnabled,
    isMultiplayer: state.isMultiplayer,
    playerId: state.playerId,
    isThinking: state.isThinking,
    handleCellClick,
    isCellSelected,
    isValidMoveTarget,
    isValidCaptureTarget,
    getCellClasses,
    getPieceClasses,
    getCellCoordinates,
  };
}
