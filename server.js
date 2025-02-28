import next from "next";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { parse } from "url";

// Initialize Next.js
const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

// Store rooms and their players
const rooms = {};

app.prepare().then(() => {
  // Create the HTTP server
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handler(req, res, parsedUrl);
  });
  // Initialize Socket.io
  const io = new Server(httpServer);
  // Socket.io connection handler
  io.on("connection", (socket) => {
    // Create room
    socket.on("create-room", ({ playerName }) => {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

      socket.join(roomId);

      // Store room data
      rooms[roomId] = {
        id: roomId,
        players: [
          {
            id: socket.id,
            name: playerName,
            player: 1,
          },
        ],
        board: [],
        currentPlayer: 1,
        gameOver: null,
        selectedPiece: null,
        mustCapture: false,
        sequentialCapture: false,
        createdAt: new Date(),
      };

      socket.emit("room-created", {
        roomId,
        player: {
          id: socket.id,
          name: playerName,
          player: 1,
        },
        roomInfo: rooms[roomId],
      });

      console.log(`Room created: ${roomId} by player ${playerName}`);
    });

    // Join room
    socket.on("join-room", ({ roomId, playerName }) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      // Check if room is full
      if (room.size >= 2) {
        socket.emit("error", { message: "Room is full" });
        return;
      }

      socket.join(roomId);
      const connectedClients = Array.from(room);

      // Get host player name from stored room data
      const hostPlayerName = rooms[roomId]?.players[0]?.name || "Player 1";

      // Create or update player information
      const newPlayer = {
        id: socket.id,
        name: playerName,
        player: 2,
      };

      // Update room data with new player
      if (rooms[roomId]) {
        rooms[roomId].players.push(newPlayer);
      } else {
        // If room isn't in our store for some reason, create it
        rooms[roomId] = {
          id: roomId,
          players: [
            {
              id: connectedClients[0],
              name: hostPlayerName,
              player: 1,
            },
            newPlayer,
          ],
          board: [],
          currentPlayer: 1,
          gameOver: null,
          selectedPiece: null,
          mustCapture: false,
          sequentialCapture: false,
          createdAt: new Date(),
        };
      }

      socket.emit("room-joined", {
        roomId,
        player: newPlayer,
        roomInfo: rooms[roomId],
      });

      // Notify host
      socket.to(roomId).emit("player-joined", {
        player: newPlayer,
        roomInfo: rooms[roomId],
      });

      console.log(`Player ${playerName} joined room: ${roomId}`);
    });

    // Update game state on move
    socket.on("update-game-state", ({ roomId, gameState, playerId }) => {
      // Update stored room data
      if (rooms[roomId]) {
        rooms[roomId] = {
          ...rooms[roomId],
          ...gameState,
        };
      }

      socket.to(roomId).emit("game-state-updated", { gameState, playerId });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("A client disconnected:", socket.id);

      // Find rooms the disconnected player was in
      Object.keys(rooms).forEach((roomId) => {
        const room = rooms[roomId];
        const playerIndex = room.players.findIndex((p) => p.id === socket.id);

        if (playerIndex !== -1) {
          // Remove player from room
          room.players.splice(playerIndex, 1);
          if (room.players.length > 0) room.players[0].player = 1;

          // If room is empty, remove it
          if (room.players.length === 0) {
            delete rooms[roomId];
            console.log(`Room ${roomId} deleted (no players left)`);
          } else {
            // Notify remaining players
            io.to(roomId).emit("player-left", {
              playerId: socket.id,
              roomInfo: room,
            });
            console.log(`Player ${socket.id} left room ${roomId}`);
          }
        }
      });
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
    });
});
