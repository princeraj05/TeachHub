import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL || "https://skyblue-yak-430824.hostingersite.com", {
  transports: ["websocket"],
  autoConnect: false
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});

export default socket;