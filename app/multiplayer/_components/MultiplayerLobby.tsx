"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMultiplayer } from "@/context/MultiGameContext";
import { useState } from "react";

export const MultiplayerLobby = () => {
  const {
    isConnected,
    roomId,
    playerInfo,
    roomInfo,
    isInRoom,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
  } = useMultiplayer();

  const [playerName, setPlayerName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }
    createRoom(playerName);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!joinRoomId.trim()) {
      alert("Please enter a room ID");
      return;
    }
    joinRoom(joinRoomId.trim().toUpperCase(), playerName);
    setShowJoinDialog(false);
  };

  // If not connected to the server yet
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg shadow-md">
        <p className="text-xl font-semibold text-gray-800 mb-4">
          Connecting to server...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If in a room, show the room information
  if (isInRoom && roomInfo) {
    return (
      <div className="rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Room</h2>

        <div className="bg-indigo-50 p-4 rounded-md mb-4">
          <p className="text-lg font-medium text-gray-700">
            Room ID: <span className="font-bold text-blue-600">{roomId}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Share this code with your friend to join the game
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Players:</h3>
          <ul className="space-y-2">
            {roomInfo.players.map((player) => (
              <li
                key={player.id}
                className="flex items-center gap-2 p-2 bg-slate-50 rounded-md"
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    player.player === 1 ? "bg-blue-500" : "bg-rose-500"
                  }`}
                ></div>
                <span className="font-medium">
                  {player.name}
                  {player.id === playerInfo?.id ? " (You)" : ""}
                  {player.player === 1 ? " - Blue" : " - Red"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {roomInfo.players.length < 2 && (
          <div className="bg-amber-50 p-3 rounded-md mb-4 border border-amber-200">
            <p className="text-amber-700">
              Waiting for another player to join...
            </p>
          </div>
        )}

        <Button variant="destructive" className="w-full" onClick={leaveRoom}>
          Leave Room
        </Button>
      </div>
    );
  }

  // If not in a room, show the create/join options
  return (
    <div className="rounded-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Play Online</h2>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-3 rounded-md mb-4 border border-rose-200">
          {error}
        </div>
      )}

      <div className="mb-6">
        <Label htmlFor="playerName" className="block text-gray-700 mb-2">
          Your Name
        </Label>
        <Input
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="w-full"
        />
      </div>

      <div className="space-y-4">
        <Button
          variant="default"
          className="w-full"
          onClick={handleCreateRoom}
          disabled={!playerName.trim()}
        >
          Create New Game
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowJoinDialog(true)}
          disabled={!playerName.trim()}
        >
          Join Existing Game
        </Button>
      </div>

      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Game</DialogTitle>
            <DialogDescription>
              Enter the room ID provided by your friend
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="roomId" className="block text-gray-700 mb-2">
              Room ID
            </Label>
            <Input
              id="roomId"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
              placeholder="Enter room ID (e.g., ABC123)"
              className="w-full"
              maxLength={6}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoinRoom} disabled={!joinRoomId.trim()}>
              Join
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
