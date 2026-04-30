import websocket from "@fastify/websocket";
import { fastify } from "../server_setup.js";
import type { FastifyRequest } from "fastify";
import { translate } from "../../routes/utils/translationBack.js";
import { extractUserIdHotJwt } from "./utils/utils.js";
import { GameState } from "../../game/types.js";
import { gameTick } from "../../game/index.js";

interface OnlineGame {

    id1: number;
    id2: number;
    ws1: websocket.WebSocket;
    ws2: websocket.WebSocket;
    state: GameState;
}


const activeGames = new Map<number, OnlineGame>();


export function createPongWebsocketRoute() {

    fastify.register(async function (fastify) {
        fastify.get('/ws/pong', { websocket: true }, async (socket: websocket.WebSocket, request: FastifyRequest) => {
            const t = translate(request);
            try {
                const { id, matchId } = extractUserIdHotJwt(t, request);

                let actualGame = activeGames.get(matchId);

                if (!actualGame) {
                    const newGame: OnlineGame = { id1: id, id2: null, ws1: socket, ws2: null, gameState: null };
                    activeGames.set(matchId, newGame);
                    actualGame = newGame;
                    socket.on('message', (data) => {
                        const msg = JSON.parse(data.toString());
                        actualGame.state.paddle1.dy = msg.dy;
                    });
                }
                else {
                    actualGame.id2 = id;
                    actualGame.ws2 = socket
                    let lastTime = performance.now();
                    setInterval(() => {
                        const now = performance.now();
                        const deltaMs = now - lastTime;
                        lastTime = now;
                        actualGame.state = gameTick(actualGame.state, deltaMs);
                        socket.send(JSON.stringify(actualGame.state));
                        actualGame.ws1.send(JSON.stringify(actualGame.state));
                    }, 60);


                    socket.on('message', (data) => {
                        const msg = JSON.parse(data.toString());
                        actualGame.state.paddle2.dy = msg.dy;
                    });
                }

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
