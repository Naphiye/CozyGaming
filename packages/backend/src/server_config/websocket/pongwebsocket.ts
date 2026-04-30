import websocket from "@fastify/websocket";
import { fastify } from "../server_setup.js";
import type { FastifyRequest } from "fastify";
import { translate } from "../../routes/utils/translationBack.js";
import { extractUserIdHotJwt } from "./utils/utils.js";

export const connectedUsers = new Map<number, Set<websocket.WebSocket>>(); // userId -> socket

export function createPongWebsocketRoute() {

    fastify.register(async function (fastify) {
        fastify.get('/ws/pong', { websocket: true }, async (socket: websocket.WebSocket, request: FastifyRequest) => {
            const t = translate(request);
            try {
                const { id } = extractUserIdHotJwt(t, request);

            

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
