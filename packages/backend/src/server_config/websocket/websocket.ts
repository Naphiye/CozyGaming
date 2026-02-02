import websocket from "@fastify/websocket";
import { fastify } from "../server_setup.js";
import type { FastifyRequest } from "fastify";
import { translate } from "../../routes/utils/translationBack.js";
import { extractUserIdHotJwt } from "./utils/utils.js";
import { ws_handleMessage } from "./utils/handleMessage.js";
import { ws_handleOnClose } from "./utils/handleOnClose.js";
import { ws_userFirstConnect } from "./utils/handleFirstConnexion.js";

export const connectedUsers = new Map<number, Set<websocket.WebSocket>>(); // userId -> socket

export function createWebsocketRoute() {

    fastify.register(async function (fastify) {
        fastify.get('/ws', { websocket: true }, async (socket: websocket.WebSocket, request: FastifyRequest) => {
            const t = translate(request);
            try {
                const { id } = extractUserIdHotJwt(t, request);

                // un utilisateur se cononecte ca passe ici, on lajoute a notre map
                await ws_userFirstConnect(id, socket);

                ws_handleOnClose(id, socket);

                ws_handleMessage(t, id, socket);

            } catch (error: any) {
                if (typeof error.code === "number" && error.message) {
                    console.error("WS Error : code : ", error.code, ", message : ", error.message);
                }
                else {
                    console.error("WS Error : ", error);
                }
                socket.close();
            }
        });
    })
}
