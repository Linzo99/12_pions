"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGame } from "@/context/GameContext";
import GameRules from "./GameRules";
import { useMultiplayer } from "@/context/MultiGameContext";

const GameControls = () => {
  const { state, dispatch } = useGame();
  const { isInRoom } = useMultiplayer();

  return (
    <div className="my-6 flex flex-wrap justify-center items-center gap-4">
      <GameRules />
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
        disabled={
          state.isThinking ||
          (!state.gameOver && state.isMultiplayer) ||
          isInRoom
        }
        onClick={() => dispatch({ type: "RESET_GAME" })}
        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded-lg"
      >
        Reset Game
      </Button>
    </div>
  );
};

export default GameControls;
