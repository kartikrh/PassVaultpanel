import { io } from "socket.io-client";
let socket = null;

if (process.env.REACT_APP_IS_SOCKET === "true") {
    socket = io.connect(process.env.REACT_APP_SOCKET_URL, {
        transports: ["websocket"]
    });
}

export default socket;