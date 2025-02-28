"use client";

import MultiplayerInfo from "@/app/multiplayer/_components/MultiplayerInfo";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";

const GameInfo = () => {
  const { state, dispatch } = useGame();
  const { currentPlayer, gameOver, mustCapture, sequentialCapture } = state;

  return (
    <div className="w-full lg:w-64 space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <h3 className="font-semibold text-lg border-b pb-2 mb-2">
          Game Status
        </h3>
        {gameOver ? (
          <div className="text-center">
            <p className="font-bold text-xl mb-2">
              {gameOver === "draw" ? "Game Draw!" : `Player ${gameOver} Wins!`}
            </p>
            <Button onClick={() => dispatch({ type: "RESET_GAME" })}>
              Play Again
            </Button>
          </div>
        ) : (
          <div>
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
            <div className="space-y-2">
              {mustCapture && (
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
          </div>
        )}
      </div>

      <MultiplayerInfo />
    </div>
  );
};

export default GameInfo;
