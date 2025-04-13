import { io } from "socket.io-client";
import { getToken } from "../helpers/api_helper";

let socket = null;

const createSocket = () => {
    if (process.env.REACT_APP_IS_SOCKET === "true" && !socket) {
        socket = io.connect(process.env.REACT_APP_SOCKET_URL, {
            transports: ["websocket"],
            auth: {
                token: getToken()
            }
        });
    }
    return socket;
};

export default createSocket;