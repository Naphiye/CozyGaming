import websocket from "@fastify/websocket";
import { fastify } from "../server_setup.js";
import type { FastifyRequest } from "fastify";
import { translate } from "../../routes/utils/translationBack.js";
import { extractUserIdHotJwt } from "./utils/utils.js";
import type { GameState } from "../../game/types.js";
import { gameTick, initGameState } from "../../game/index.js";
import { db } from "../sqlite/db.js";
import { users } from "../sqlite/schema.js";
import { eq } from "drizzle-orm";


interface OnlineGame {

    id1: number;
    id2: number | null;
    ws1: websocket.WebSocket;
    ws2: websocket.WebSocket | null;
    state: GameState;
    intervalId: NodeJS.Timeout | null;
}

interface WaitingPlayer { id: number; socket: websocket.WebSocket; }

const activeGames = new Map<number, OnlineGame>();
let waitingPlayer: WaitingPlayer | null = null;


export function createPongWebsocketRoute() {

    fastify.register(async function (fastify) {
        fastify.get('/ws/pong', { websocket: true }, async (socket: websocket.WebSocket, request: FastifyRequest) => {
            const t = translate(request);
            try {
                const { id } = extractUserIdHotJwt(t, request);

                if (!waitingPlayer) {
                    //joueur1
                    waitingPlayer = { id, socket };
                    socket.send(JSON.stringify({ type: "opponentWaiting" }));
                    socket.on('close', () => {
                        waitingPlayer = null;
                    });

                    socket.on('message', (data) => {
                        const game = activeGames.get(id);  // on cherche au moment du message
                        if (!game) return;                 // la partie n'existe pas encore, on ignore
                        const msg = JSON.parse(data.toString());
                        game.state.paddle1.dy = msg.dy;
                    });

                }
                else {
                    //joueur2
                    const newGame: OnlineGame = { id1: waitingPlayer.id, id2: id, ws1: waitingPlayer.socket, ws2: socket, state: initGameState(), intervalId: null };
                    activeGames.set(newGame.id1, newGame);
                    waitingPlayer = null;

                    const result1 = await db.select({ username: users.username })
                        .from(users)
                        .where(eq(users.id, newGame.id1));

                    const result2 = await db.select({ username: users.username })
                        .from(users)
                        .where(eq(users.id, id));

                    newGame.state.players.left = result1[0]?.username ?? "Player 1";
                    newGame.state.players.right = result2[0]?.username ?? "Player 2";
                    let lastTime = performance.now();
                    newGame.intervalId = setInterval(() => {
                        const now = performance.now();
                        const deltaMs = now - lastTime;
                        lastTime = now;
                        newGame.state = gameTick(newGame.state, deltaMs);
                        socket.send(JSON.stringify(newGame.state));
                        newGame.ws1.send(JSON.stringify(newGame.state));
                    }, 60);



                    socket.on('message', (data) => {
                        const msg = JSON.parse(data.toString());
                        newGame.state.paddle2.dy = msg.dy;
                    });

                    socket.on('close', () => {
                        newGame.ws1.send(JSON.stringify({ type: "opponentDisconnected" }));
                        if (newGame.intervalId != null)
                            clearInterval(newGame.intervalId);
                        activeGames.delete(newGame.id1);
                    });

                    newGame.ws1.on('close', () => {
                        socket.send(JSON.stringify({ type: "opponentDisconnected" }));
                        if (newGame.intervalId != null)
                            clearInterval(newGame.intervalId);
                        activeGames.delete(newGame.id1);
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
