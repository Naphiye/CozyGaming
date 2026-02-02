import websocket from "@fastify/websocket";
import { sendOnlineStatusAllUsers } from "./utils.js";
import { connectedUsers } from "../websocket.js";


export async function ws_userFirstConnect(id: number, socket: websocket.WebSocket) {
    // check si ma web socket est deja ajoutée sinon je lajoute
    if (!isWebsocketInMap(id, socket)) {
        if (!connectedUsers.has(id)) {
            // créer un set d'id si inexistant
            connectedUsers.set(id, new Set());
        }
        addWebsocket(id, socket);
    }
    // et la je dois envoyer a tout mes copains que je suis connecté
    await sendOnlineStatusAllUsers(id, true, true);
}

// cherche dans la map la websocket correspondant a l'id voir si elle existe
function isWebsocketInMap(id: number, socket: websocket.WebSocket) {
    // si luser id nexiste pas dans la map alors on a pas de websocket
    const idAllSocket = connectedUsers.get(id);
    if (!idAllSocket || idAllSocket.size === 0) {
        return false;
    }
    // chercher la websocket correspondant a luserid
    const existingUserId = [...idAllSocket.entries()].find(([id, ws]) => ws === socket)?.[0];
    if (!existingUserId) {
        return false;
    }
    return true;
}

function addWebsocket(id: number, socket: websocket.WebSocket) {
    const idAllSocket = connectedUsers.get(id);
    if (idAllSocket) {
        idAllSocket.add(socket);
    }
}