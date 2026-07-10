import { io } from "socket.io-client";

const socket = io("https://hospital-backend-9e41.onrender.com");

export default socket;