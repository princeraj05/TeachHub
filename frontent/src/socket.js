import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL || "https://skyblue-yak-430824.hostingersite.com", {
  transports: ["polling", "websocket"],
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
  timeout: 10000
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("ℹ️ Socket disconnected:", reason);
});

export default socket;