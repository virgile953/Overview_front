import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : "0.0.0.0"; // Listen on all interfaces in production
const port = process.env.PORT || 3000;

// CORS origins for development and production
const allowedOrigins = dev
  ? ["http://localhost:3000"]
  : ["https://overview.management"];

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port, turbopack: true });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Make io globally accessible
  global.io = io;

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join organization room
    socket.on("join-organization", (organizationId) => {
      if (!organizationId) {
        console.warn("No organization ID provided");
        return;
      }

      // Leave all previous rooms (except default rooms)
      const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id);
      rooms.forEach((room) => socket.leave(room));

      // Join new organization room
      socket.join(`org:${organizationId}`);
      console.log(`Socket ${socket.id} joined organization: ${organizationId}`);

      // Optionally send confirmation
      socket.emit("joined-organization", { organizationId });
    });

    // Leave organization room
    socket.on("leave-organization", (organizationId) => {
      if (organizationId) {
        socket.leave(`org:${organizationId}`);
        console.log(`Socket ${socket.id} left organization: ${organizationId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server is running`);
    });
});