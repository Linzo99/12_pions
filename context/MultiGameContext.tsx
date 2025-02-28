"use client";

import { Board, Player, Position } from "@/types/game";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { GameState, useGame } from "./GameContext";

// Define types for our multiplayer context
type PlayerInfo = {
  id: string;
  name: string;
  player: Player;
};

type RoomInfo = {
  id: string;
  players: PlayerInfo[];
  board: Board;
  currentPlayer: Player;
  gameOver: Player | "draw" | null;
  selectedPiece: Position | null;
  mustCapture: boolean;
  sequentialCapture: boolean;
  createdAt: Date;
};

interface MultiplayerContextType {
  socket: Socket | null;
  isConnected: boolean;
  roomId: string | null;
  playerInfo: PlayerInfo | null;
  roomInfo: RoomInfo | null;
  isHost: boolean;
  isInRoom: boolean;
  isRoomFull: boolean;
  error: string | null;
  createRoom: (playerName: string) => void;
  joinRoom: (roomId: string, playerName: string) => void;
  leaveRoom: () => void;
}

const MultiplayerContext = createContext<MultiplayerContextType | null>(null);

export const MultiplayerProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { state, dispatch } = useGame();

  // Initialize socket connection
  useEffect(() => {
    // Socket.io client setup
    const client = io();
    setSocket(client);

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
      // Reset state on disconnect
      setRoomId(null);
      setPlayerInfo(null);
      setRoomInfo(null);
      setIsHost(false);
    }

    function onError(err: { message: string }) {
      console.error("Socket error:", err.message);
      setError(err.message);
    }

    client.on("connect", onConnect);
    client.on("disconnect", onDisconnect);
    client.on("error", onError);

    // Clean up event listeners on unmount
    return () => {
      client.off("connect", onConnect);
      client.off("disconnect", onDisconnect);
      client.off("error", onError);
      client.disconnect();
    };
  }, []);

  // Set up room event handlers
  useEffect(() => {
    if (!socket) return;

    function onRoomCreated(data: {
      roomId: string;
      player: PlayerInfo;
      roomInfo: RoomInfo;
    }) {
      setRoomId(data.roomId);
      setPlayerInfo(data.player);
      setRoomInfo(data.roomInfo);
      setIsHost(true);
      setError(null);

      // Initialize the game board
      dispatch({ type: "INITIALIZE_BOARD" });
      dispatch({ type: "SET_MULTIPLAYER", value: true });
      dispatch({ type: "SET_PLAYER_ID", value: 1 });
    }

    function onRoomJoined(data: {
      roomId: string;
      player: PlayerInfo;
      roomInfo: RoomInfo;
    }) {
      setRoomId(data.roomId);
      setPlayerInfo(data.player);
      setRoomInfo(data.roomInfo);
      setIsHost(false);
      setError(null);

      // Sync with the room's game state
      if (data.roomInfo.board && data.roomInfo.board.length > 0) {
        dispatch({ type: "SET_BOARD", board: data.roomInfo.board });
        dispatch({
          type: "SET_CURRENT_PLAYER",
          player: data.roomInfo.currentPlayer,
        });
      } else {
        dispatch({ type: "INITIALIZE_BOARD" });
      }

      dispatch({ type: "SET_MULTIPLAYER", value: true });
      dispatch({ type: "SET_PLAYER_ID", value: 2 });
    }

    function onPlayerJoined(data: { player: PlayerInfo; roomInfo: RoomInfo }) {
      setRoomInfo(data.roomInfo);
    }

    function onGameStateUpdated(data: {
      roomId: string;
      gameState: {
        board: Board;
        currentPlayer: Player;
        gameOver: Player | "draw" | null;
        selectedPiece: Position | null;
        mustCapture: boolean;
        sequentialCapture: boolean;
      };
      playerId: string;
    }) {
      if (playerInfo && data.playerId === playerInfo.id) return;
      dispatch({ type: "SET_STATE", value: data.gameState });
    }

    function onPlayerDisconnected(data: {
      playerId: string;
      playerName: string;
    }) {
      // If we're in a room, update the room info to reflect that a player left
      if (roomInfo) {
        const updatedPlayers = roomInfo.players.filter(
          (p) => p.id !== data.playerId,
        );
        setRoomInfo({
          ...roomInfo,
          players: updatedPlayers,
        });
      }

      // Show a notification to the user
      setError(`Player ${data.playerName} has disconnected`);
      dispatch({ type: "SET_MULTIPLAYER", value: false });
    }

    dispatch({
      type: "SET_ON_MOVE_END",
      value: (newState: Partial<GameState>) => {
        if (!socket || !roomId) return;
        socket.emit("update-game-state", {
          roomId,
          gameState: newState,
          playerId: playerInfo!.id,
        });
      },
    });

    // Register event handlers
    socket.on("room-created", onRoomCreated);
    socket.on("room-joined", onRoomJoined);
    socket.on("player-joined", onPlayerJoined);
    socket.on("game-state-updated", onGameStateUpdated);
    socket.on("player-disconnected", onPlayerDisconnected);

    // Clean up event handlers on unmount
    return () => {
      socket.off("room-created", onRoomCreated);
      socket.off("room-joined", onRoomJoined);
      socket.off("player-joined", onPlayerJoined);
      socket.off("game-state-updated", onGameStateUpdated);
      socket.off("player-disconnected", onPlayerDisconnected);
    };
  }, [socket, roomId, playerInfo, roomInfo, state.currentPlayer, dispatch]);

  // Create a new game room
  const createRoom = (playerName: string) => {
    if (!socket || !isConnected) {
      setError("Not connected to server");
      return;
    }
    socket.emit("create-room", { playerName });
  };

  // Join an existing game room
  const joinRoom = (roomId: string, playerName: string) => {
    if (!socket || !isConnected) {
      setError("Not connected to server");
      return;
    }

    socket.emit("join-room", { roomId, playerName });
  };

  // Leave the current room
  const leaveRoom = () => {
    if (!socket || !roomId) return;

    // Disconnect from the room
    socket.emit("leave-room", { roomId });
    // Reset local state
    setRoomId(null);
    setPlayerInfo(null);
    setRoomInfo(null);
    setIsHost(false);
    // Reset the game
    dispatch({ type: "RESET_GAME" });
  };

  return (
    <MultiplayerContext.Provider
      value={{
        socket,
        isConnected,
        roomId,
        playerInfo,
        roomInfo,
        isHost,
        isInRoom: !!roomId,
        isRoomFull: roomInfo ? roomInfo.players.length >= 2 : false,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};

// Custom hook to use the multiplayer context
export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error("useMultiplayer must be used within a MultiplayerProvider");
  }
  return context;
};
