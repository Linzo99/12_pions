"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

import { Board, Player, Position } from "@/types/game";
import {
  countPlayerPieces,
  executeMove,
  getCaptureMoves,
  initializeBoard,
  isValidMove,
  minimax,
  promotePiece,
  getAllPossibleMoves,
} from "@/utils";

const GameBoard = () => {
  const [board, setBoard] = useState<Board>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [gameOver, setGameOver] = useState<Player | "draw" | null>(null);
  const [mustCapture, setMustCapture] = useState<boolean>(false);
  const [sequentialCapture, setSequentialCapture] = useState<boolean>(false);
  const [isComputerEnabled, setIsComputerEnabled] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    setBoard(initializeBoard());
  }, []);

  const checkForCaptures = (playerNumber: number): boolean => {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const piece = board[row][col];
        if (piece && piece.player === playerNumber) {
          const captureMoves = getCaptureMoves(board, row, col);
          if (captureMoves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const checkForForcedCaptures = () => {
    if (board.length === 0) return;

    if (sequentialCapture && selectedPiece) {
      const [row, col] = selectedPiece;
      const piece = board[row][col];
      if (piece && piece.player === currentPlayer) {
        const captures = getCaptureMoves(board, row, col);
        setMustCapture(captures.length > 0);
      } else {
        setMustCapture(false);
      }
      return;
    }

    setMustCapture(checkForCaptures(currentPlayer));
  };

  const checkGameOver = (currentBoard: Board) => {
    const player1Pieces = countPlayerPieces(currentBoard, 1);
    const player2Pieces = countPlayerPieces(currentBoard, 2);

    if (player1Pieces === 0) {
      setGameOver(2);
    } else if (player2Pieces === 0) {
      setGameOver(1);
    } else if (player1Pieces === 1 && player2Pieces === 1) {
      setGameOver("draw");
    }
  };

  const handleRegularMove = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ) => {
    if (isValidMove(board, fromRow, fromCol, toRow, toCol)) {
      const newBoard = executeMove(board, [fromRow, fromCol], [toRow, toCol]);
      promotePiece(newBoard, toRow, toCol);
      setBoard(newBoard);
      setSelectedPiece(null);
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      checkGameOver(newBoard);
    } else {
      setSelectedPiece(null);
    }
  };

  const makeComputerMove = async () => {
    if (
      !isComputerEnabled ||
      currentPlayer !== 1 ||
      gameOver ||
      board.length === 0
    ) {
      return;
    }

    try {
      setIsThinking(true);

      // Debug: Check if there are any valid moves
      const allMoves = getAllPossibleMoves(board, 1);
      console.log("Available computer moves:", allMoves);

      const result = minimax(
        board,
        4,
        -Infinity,
        Infinity,
        true,
        1, // currentPlayer
        1, // maximizingPlayer
      );

      console.log("Minimax result:", result);

      if (result.move) {
        const { from, to, captures } = result.move;

        if (captures.length > 0) {
          const newBoard = executeMove(board, from, to);
          for (const [captureRow, captureCol] of captures) {
            newBoard[captureRow][captureCol] = null;
          }

          promotePiece(newBoard, to[0], to[1]);
          setBoard(newBoard);

          const nextCaptures = getCaptureMoves(newBoard, to[0], to[1]);
          if (nextCaptures.length > 0) {
            setSelectedPiece([to[0], to[1]]);
            setMustCapture(true);
            setSequentialCapture(true);
          } else {
            setSelectedPiece(null);
            setCurrentPlayer(2);
            setMustCapture(false);
            setSequentialCapture(false);
            checkGameOver(newBoard);
          }
        } else {
          const newBoard = executeMove(board, from, to);
          promotePiece(newBoard, to[0], to[1]);
          setBoard(newBoard);
          setSelectedPiece(null);
          setCurrentPlayer(2);
          checkGameOver(newBoard);
        }
      } else if (allMoves.length === 0) {
        setGameOver(2); // Player 2 wins if computer (Player 1) has no moves
      }
    } catch (error) {
      console.error("Computer move error:", error);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    if (isComputerEnabled && currentPlayer === 1 && !gameOver) {
      setTimeout(makeComputerMove, 500);
    }
  }, [isComputerEnabled, currentPlayer, gameOver, sequentialCapture]);

  const handleCellClick = (row: number, col: number) => {
    if (gameOver) return;
    if (isComputerEnabled && currentPlayer === 1) return;

    const clickedPiece = board[row][col];

    // If we're in the middle of a sequential capture
    if (sequentialCapture && selectedPiece) {
      const [fromRow, fromCol] = selectedPiece;
      const captureMoves = getCaptureMoves(board, fromRow, fromCol);
      const captureMove = captureMoves.find(
        (move) =>
          move.finalPosition[0] === row && move.finalPosition[1] === col,
      );

      if (captureMove) {
        const newBoard = executeMove(
          board,
          [fromRow, fromCol],
          captureMove.finalPosition,
        );
        for (const [captureRow, captureCol] of captureMove.capturedPositions) {
          newBoard[captureRow][captureCol] = null;
        }
        promotePiece(newBoard, row, col);
        setBoard(newBoard);

        const additionalCaptures = getCaptureMoves(newBoard, row, col);
        if (additionalCaptures.length > 0) {
          setSelectedPiece([row, col]);
          setSequentialCapture(true);
          setMustCapture(true);
        } else {
          setSelectedPiece(null);
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
          setSequentialCapture(false);
          setMustCapture(false);
          checkGameOver(newBoard);
        }
      }
      return;
    }

    // If a piece is already selected
    if (selectedPiece) {
      const [fromRow, fromCol] = selectedPiece;
      const selectedCell = board[fromRow][fromCol];

      if (!selectedCell || selectedCell.player !== currentPlayer) {
        setSelectedPiece(null);
        return;
      }

      // Check for forced captures
      if (mustCapture) {
        const captureMoves = getCaptureMoves(board, fromRow, fromCol);
        const captureMove = captureMoves.find(
          (move) =>
            move.finalPosition[0] === row && move.finalPosition[1] === col,
        );

        if (captureMove) {
          const newBoard = executeMove(
            board,
            [fromRow, fromCol],
            captureMove.finalPosition,
          );
          for (const [
            captureRow,
            captureCol,
          ] of captureMove.capturedPositions) {
            newBoard[captureRow][captureCol] = null;
          }
          promotePiece(newBoard, row, col);
          setBoard(newBoard);

          const additionalCaptures = getCaptureMoves(newBoard, row, col);
          if (additionalCaptures.length > 0) {
            setSelectedPiece([row, col]);
            setMustCapture(true);
            setSequentialCapture(true);
          } else {
            setSelectedPiece(null);
            setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
            setMustCapture(false);
            setSequentialCapture(false);
            checkGameOver(newBoard);
          }
        }
        return;
      }

      // Regular move
      if (isValidMove(board, fromRow, fromCol, row, col)) {
        handleRegularMove(fromRow, fromCol, row, col);
      } else {
        setSelectedPiece(null);
      }
    } else if (clickedPiece?.player === currentPlayer) {
      // Select a new piece
      if (mustCapture) {
        const captures = getCaptureMoves(board, row, col);
        if (captures.length > 0) {
          setSelectedPiece([row, col]);
        }
      } else {
        setSelectedPiece([row, col]);
      }
    }
  };

  useEffect(() => {
    checkForForcedCaptures();
  }, [board, currentPlayer, selectedPiece]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-4 md:p-8">
      {/* Computer Player Toggle */}
      <div className="mb-6 flex items-center space-x-2">
        <Switch
          id="computer-mode"
          checked={isComputerEnabled}
          onCheckedChange={setIsComputerEnabled}
        />
        <Label htmlFor="computer-mode">Play against computer</Label>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center lg:items-start w-full max-w-7xl mx-auto">
        {/* Game Board */}
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <div className="grid grid-cols-5 gap-0 border-4 md:border-8 border-gray-800 shadow-xl aspect-square">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isSelected =
                  selectedPiece &&
                  selectedPiece[0] === rowIndex &&
                  selectedPiece[1] === colIndex;
                const isValidMoveTarget =
                  selectedPiece &&
                  isValidMove(
                    board,
                    selectedPiece[0],
                    selectedPiece[1],
                    rowIndex,
                    colIndex,
                  );
                const isValidCapture =
                  selectedPiece &&
                  getCaptureMoves(
                    board,
                    selectedPiece[0],
                    selectedPiece[1],
                  ).some(
                    (move) =>
                      move.finalPosition[0] === rowIndex &&
                      move.finalPosition[1] === colIndex,
                  );

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-32 h-32 ${
                      (rowIndex + colIndex) % 2 === 0
                        ? "bg-amber-100"
                        : "bg-amber-800"
                    } ${
                      isSelected || isValidMoveTarget || isValidCapture
                        ? "ring-4 ring-yellow-400 ring-inset"
                        : ""
                    } relative cursor-pointer transition-all duration-150 hover:brightness-110`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell && (
                      <div
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[70%] h-[70%] rounded-full 
                          ${
                            cell.player === 1
                              ? "bg-gradient-to-br from-blue-400 to-blue-600"
                              : "bg-gradient-to-br from-red-400 to-red-600"
                          } 
                          ${
                            cell.type === "king"
                              ? "border-[8px] border-yellow-400 shadow-lg"
                              : "border-4 border-black/10"
                          }
                          shadow-md
                          transition-all duration-300 ease-out
                          hover:scale-105 hover:shadow-lg`}
                      >
                        {cell.type === "king" && (
                          <div className="absolute inset-0 flex items-center justify-center text-yellow-400 text-5xl font-bold">
                            ♔
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className="absolute top-2 left-2 text-base font-semibold 
                      ${(rowIndex + colIndex) % 2 === 0 ? 'text-amber-800' : 'text-amber-100'}"
                    >
                      {`${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`}
                    </div>
                  </div>
                );
              }),
            )}
          </div>
        </div>

        {/* Game Info - Smaller Sidebar */}
        <div className="w-full lg:w-64 space-y-4">
          {/* Current Player */}
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
              Current Turn
            </h2>
            <div
              className={`
              p-3 rounded-lg border-2 
              ${currentPlayer === 1 ? "border-blue-200 bg-blue-50" : "border-red-200 bg-red-50"}
            `}
            >
              <p
                className={`
                text-base font-bold
                ${currentPlayer === 1 ? "text-blue-600" : "text-red-600"}
              `}
              >
                {`Player ${currentPlayer}'s Turn`}
              </p>
            </div>
          </div>

          {/* Game Status */}
          <div className="space-y-3">
            {gameOver && (
              <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200 shadow-lg">
                <h3 className="text-xl font-bold text-yellow-700 mb-2">
                  Game Over!
                </h3>
                <p className="text-base text-yellow-600">
                  {gameOver === "draw"
                    ? "It's a draw!"
                    : `Player ${gameOver} wins!`}
                </p>
                <Button
                  onClick={() => {
                    setBoard(initializeBoard());
                    setCurrentPlayer(1);
                    setSelectedPiece(null);
                    setGameOver(null);
                    setMustCapture(false);
                    setSequentialCapture(false);
                    setIsThinking(false);
                  }}
                  className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600"
                >
                  Play Again
                </Button>
              </div>
            )}

            {mustCapture && !gameOver && (
              <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200 shadow-lg">
                <p className="text-sm font-semibold text-orange-600">
                  Capture move available!
                </p>
              </div>
            )}

            {sequentialCapture && (
              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 shadow-lg">
                <p className="text-sm font-semibold text-green-600">
                  Sequential capture in progress!
                </p>
              </div>
            )}
          </div>

          {/* Game Rules Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Game Rules
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mb-4">
                  Game Rules
                </DialogTitle>
                <DialogDescription>
                  <div className="space-y-6">
                    {/* Basic Movement */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Basic Movement
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>
                          • Regular pieces move one space orthogonally (up,
                          down, left, right)
                        </li>
                        <li>• No diagonal movements allowed</li>
                        <li>• Pieces can only move to empty spaces</li>
                      </ul>
                    </div>

                    {/* Capturing */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Capturing
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>{"• Capture by jumping over opponent's pieces"}</li>
                        <li>
                          {"• Multiple captures in one turn are possible"}
                        </li>
                        <li>
                          {"• If a capture is available, it must be taken"}
                        </li>
                        <li>
                          {
                            "• After a capture, check for additional captures with the same piece"
                          }
                        </li>
                      </ul>
                    </div>

                    {/* Kings */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Kings
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>
                          {
                            "• A piece becomes king when reaching the opposite end"
                          }
                        </li>
                        <li>
                          {
                            "• A regular piece becomes king when it's the last piece remaining"
                          }
                        </li>
                        <li>
                          {
                            "• Kings can move multiple spaces in any orthogonal direction"
                          }
                        </li>
                        <li>
                          {
                            "• Kings can capture from any distance if path is clear"
                          }
                        </li>
                      </ul>
                    </div>

                    {/* Winning */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Winning
                      </h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>{"• Capture all opponent's pieces to win"}</li>
                        <li>
                          {
                            "• Game ends in a draw if no valid moves are available"
                          }
                        </li>
                        <li>
                          {"Player must make a move when it's their turn"}
                        </li>
                      </ul>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() => {
              setBoard(initializeBoard());
              setCurrentPlayer(1);
              setSelectedPiece(null);
              setGameOver(null);
              setMustCapture(false);
              setSequentialCapture(false);
              setIsThinking(false);
            }}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded-lg"
          >
            Reset Game
          </Button>
        </div>
      </div>

      {/* Add thinking indicator */}
      {isThinking && (
        <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
          Computer is thinking...
        </div>
      )}
    </div>
  );
};

export default GameBoard;
