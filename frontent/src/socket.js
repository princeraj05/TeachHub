import { io } from "socket.io-client";
import API_URL from "./config/api";

const socket = io(API_URL, {
  transports: ["polling", "websocket"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  timeout: 20000
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("ℹ️ Socket disconnected:", reason);
  if (reason === "io server disconnect") {
    const token = localStorage.getItem("token");
    if (token) {
      socket.auth = { token };
      socket.connect();
    }
  }
});

export default socket;