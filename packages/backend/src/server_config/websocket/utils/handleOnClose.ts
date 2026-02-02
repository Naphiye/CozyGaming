import websocket from "@fastify/websocket";
import { sendOnlineStatusAllUsers } from "./utils.js";
import { connectedUsers } from "../websocket.js";

export function ws_handleOnClose(id: number, socket: websocket.WebSocket) {
    // gerer les fermetures de la socket
    socket.on("close", async () => {
        // recuperer mes sockets
        const myWs = connectedUsers.get(id);
        // si on a plus de 1 websocket on est connecté sinon si cest la derniere alors on envoie hors ligne a tout le monde
        if (myWs && myWs.size === 1) {
            await sendOnlineStatusAllUsers(id, false, false);
        }
        // jenleve ma socket quand je ferme
        deleteWebsocket(id, socket);
        // console.log("ws DECONNECTE au back : id ", id);
    });
}

function deleteWebsocket(id: number, socket: websocket.WebSocket) {
    const idAllSocket = connectedUsers.get(id);
    if (idAllSocket) {
        idAllSocket.delete(socket);
    }
}