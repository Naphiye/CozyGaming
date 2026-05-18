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
                        if (msg.type === "pause") {
                            if (game.state.status === "playing") {
                                game.state.status = "paused1";
                                socket.send(JSON.stringify({ type: "pause" }));
                                if (game.ws2) {
                                    game.ws2.send(JSON.stringify({ type: "pause" }));
                                }

                            }
                            else if (game.state.status === "paused1") {
                                game.state.status = "playing";
                            }
                        }
                        else {
                            game.state.paddle1.dy = msg.dy;
                        }
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
                    setTimeout(() => {
                        socket.send(JSON.stringify({ type: "countdown", value: 3 }));
                        newGame.ws1.send(JSON.stringify({ type: "countdown", value: 3 }));

                    }, 0);
                    setTimeout(() => {
                        socket.send(JSON.stringify({ type: "countdown", value: 2 }));
                        newGame.ws1.send(JSON.stringify({ type: "countdown", value: 2 }));

                    }, 1000);
                    setTimeout(() => {
                        socket.send(JSON.stringify({ type: "countdown", value: 1 }));
                        newGame.ws1.send(JSON.stringify({ type: "countdown", value: 1 }));

                    }, 2000);
                    setTimeout(() => {
                        socket.send(JSON.stringify({ type: "countdown", value: 0 }));
                        newGame.ws1.send(JSON.stringify({ type: "countdown", value: 0 }));

                    }, 3000);
                    setTimeout(() => {
                        socket.send(JSON.stringify({ type: "countdown", value: 0 }));
                        newGame.ws1.send(JSON.stringify({ type: "countdown", value: 0 }));

                        newGame.intervalId = setInterval(() => {
                            if (newGame.state.status !== "playing") return;
                            const now = performance.now();
                            const deltaMs = now - lastTime;
                            lastTime = now;
                            newGame.state = gameTick(newGame.state, deltaMs);
                            socket.send(JSON.stringify(newGame.state));
                            newGame.ws1.send(JSON.stringify(newGame.state));
                        }, 60);

                    }, 4200);


                    socket.on('message', (data) => {
                        const msg = JSON.parse(data.toString());

                        if (msg.type === "pause") {
                            if (newGame.state.status === "playing") {
                                newGame.state.status = "paused2";
                                socket.send(JSON.stringify({ type: "pause" }));
                                newGame.ws1.send(JSON.stringify({ type: "pause" }));
                            }
                            else if (newGame.state.status === "paused2") {
                                newGame.state.status = "playing";
                            }
                        }
                        else {
                            newGame.state.paddle2.dy = msg.dy;
                        }
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
