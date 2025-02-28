"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGame } from "@/context/GameContext";

// Helper function to handle the multiplayer component separately
const getMultiplayerComponent = (isMultiplayerMode: boolean) => {
  if (!isMultiplayerMode) {
    return null;
  }

  // This dynamic import is used to avoid React hook rule issues
  // We only import and use the multiplayer components when needed
  const MultiplayerInfoComponent = React.lazy(() =>
    import("../app/multiplayer/_components/MultiplayerInfo").then((mod) => ({
      default: mod.default || mod.MultiplayerInfo,
    })),
  );

  return (
    <React.Suspense
      fallback={
        <div className="bg-white p-4 rounded-xl shadow-lg">
          Loading multiplayer info...
        </div>
      }
    >
      <MultiplayerInfoComponent />
    </React.Suspense>
  );
};

const GameInfo = ({ isMultiplayer = false }: { isMultiplayer?: boolean }) => {
  const { state, resetGame } = useGame();
  const { currentPlayer, gameOver, mustCapture, sequentialCapture } = state;
  const multiplayerComponent = useMemo(
    () => getMultiplayerComponent(isMultiplayer),
    [isMultiplayer],
  );

  return (
    <div className="w-full lg:w-64 space-y-4">
      {/* Game Status */}
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <h3 className="font-semibold text-lg border-b pb-2 mb-2">
          Game Status
        </h3>
        {gameOver ? (
          <div className="text-center">
            <p className="font-bold text-xl mb-2">
              {gameOver === "draw" ? "Game Draw!" : `Player ${gameOver} Wins!`}
            </p>
            <Button onClick={resetGame}>Play Again</Button>
          </div>
        ) : (
          <>
            <p className="mb-2">
              <span className="font-semibold">Current Player:</span>{" "}
              <span
                className={`inline-block w-4 h-4 rounded-full ${
                  currentPlayer === 1
                    ? "bg-gradient-to-br from-blue-400 to-blue-600"
                    : "bg-gradient-to-br from-red-400 to-red-600"
                }`}
              ></span>{" "}
              Player {currentPlayer}
            </p>
            {mustCapture && (
              <p className="text-amber-600 font-medium">Capture available!</p>
            )}
            {sequentialCapture && (
              <p className="text-amber-600 font-medium">
                Continue capturing with selected piece!
              </p>
            )}
          </>
        )}
      </div>

      {/* Multiplayer Info - Only render in multiplayer mode */}
      {multiplayerComponent}

      {/* Game Rules */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            Game Rules
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>12 Pieces Game Rules</DialogTitle>
            <DialogDescription>
              Learn how to play this strategy board game
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <h4 className="font-medium">Objective</h4>
            <p className="text-sm">
              Capture all of your opponent's pieces or block them so they cannot
              move.
            </p>

            <h4 className="font-medium">Movement</h4>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>
                Pieces move one square horizontally, vertically, or diagonally.
              </li>
              <li>Kings can move in any direction.</li>
              <li>
                A piece becomes a king when it reaches the opponent's edge.
              </li>
            </ul>

            <h4 className="font-medium">Capturing</h4>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Capture by orthogonally jumping over an opponent's piece.</li>
              <li>
                After capturing, you may continue capturing with the same piece
                if possible.
              </li>
              <li>If a capture is available, you must take it.</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameInfo;
