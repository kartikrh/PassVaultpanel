import { io } from "socket.io-client";
import { getToken } from "../helpers/api_helper";

let socket = null;

const createSocket = () => {
    console.log('createSocket called, current socket state:', socket ? 'exists' : 'null');

    if (process.env.REACT_APP_IS_SOCKET === "true") {
        // Check if socket exists but is disconnected
        if (socket && socket.disconnected) {
            console.log('Socket exists but is disconnected, attempting to reconnect');
            socket.connect();
        }

        // Create new socket if it doesn't exist
        if (!socket) {
            console.log('Creating new socket connection to:', process.env.REACT_APP_SOCKET_URL);
            socket = io.connect(process.env.REACT_APP_SOCKET_URL, {
                transports: ["websocket"],
                auth: {
                    token: getToken()
                }
            });

            // Add event listeners for connection monitoring
            socket.on('connect', () => {
                console.log('Socket connected successfully, ID:', socket.id);
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });

            socket.on('connect_error', (error) => {
                console.log('Socket connection error:', error.message);
            });
        }
    } else {
        console.log('Socket creation skipped - REACT_APP_IS_SOCKET is not "true"');
    }

    return socket;
};

export default createSocket;