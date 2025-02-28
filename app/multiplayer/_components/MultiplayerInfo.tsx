"use client";

import { useMultiplayer } from "@/context/MultiGameContext";

export const MultiplayerInfo = () => {
  // Safe to use the hook here since this component will only be rendered in multiplayer mode
  const { isInRoom, roomInfo, playerInfo } = useMultiplayer();

  if (!isInRoom) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
      <h3 className="font-semibold text-lg border-b pb-2 mb-2">Room Info</h3>
      <p className="text-sm mb-1">
        Room ID: <span className="font-mono font-bold">{roomInfo?.id}</span>
      </p>
      <div className="mt-3">
        <h4 className="font-medium text-sm mb-1">Players:</h4>
        <ul className="space-y-1">
          {roomInfo?.players.map((player) => (
            <li key={player.id} className="text-sm flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  player.player === 1 ? "bg-blue-500" : "bg-red-500"
                }`}
              ></div>
              {player.name}
              {player.id === playerInfo?.id ? " (You)" : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MultiplayerInfo;
