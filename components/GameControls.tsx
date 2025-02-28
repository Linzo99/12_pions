"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";

const GameControls = () => {
  const { state, dispatch, resetGame } = useGame();

  return (
    <div className="my-6 flex flex-wrap justify-center items-center gap-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="computer-mode"
          checked={state.isComputerEnabled}
          onCheckedChange={(value) =>
            dispatch({ type: "TOGGLE_COMPUTER", value })
          }
          disabled={state.isThinking || state.isMultiplayer}
        />
        <Label htmlFor="computer-mode">Play against computer</Label>
      </div>

      <Button
        disabled={state.isMultiplayer && !state.gameOver}
        onClick={resetGame}
        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded-lg"
      >
        Reset Game
      </Button>
    </div>
  );
};

export default GameControls;
