import next from "next";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

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

      socket.emit("room-created", {
        roomId,
        player: {
          id: socket.id,
          name: playerName,
          player: 1,
        },
        roomInfo: {
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
        },
      });
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

      // Get connected sockets in the room
      const connectedClients = Array.from(room);

      socket.emit("room-joined", {
        roomId,
        player: {
          id: socket.id,
          name: playerName,
          player: 2,
        },
        roomInfo: {
          id: roomId,
          players: [
            // Host player info (will be updated by game state)
            {
              id: connectedClients[0],
              name: "Player 1",
              player: 1,
            },
            // New player
            {
              id: socket.id,
              name: playerName,
              player: 2,
            },
          ],
          board: [],
          currentPlayer: 1,
          gameOver: null,
          selectedPiece: null,
          mustCapture: false,
          sequentialCapture: false,
          createdAt: new Date(),
        },
      });

      // Notify host
      socket.to(roomId).emit("player-joined", {
        player: {
          id: socket.id,
          name: playerName,
          player: 2,
        },
        roomInfo: {
          id: roomId,
          players: [
            {
              id: connectedClients[0],
              name: "Player 1",
              player: 1,
            },
            {
              id: socket.id,
              name: playerName,
              player: 2,
            },
          ],
        },
      });
    });

    // Update game state on move
    socket.on("update-game-state", ({ roomId, gameState, playerId }) => {
      socket.to(roomId).emit("game-state-updated", { gameState, playerId });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("A client disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
