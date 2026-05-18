import websocket from "@fastify/websocket";
import { fastify } from "../server_setup.js";
import type { FastifyRequest } from "fastify";
import { translate } from "../../routes/utils/translationBack.js";
import { extractUserIdHotJwt } from "./utils/utils.js";
import type { GameState } from "../../game/types.js";
import { gameTick, initGameState, isGameOver } from "../../game/index.js";
import { db } from "../sqlite/db.js";
import { matchHistory, users } from "../sqlite/schema.js";
import { eq } from "drizzle-orm";

interface OnlineGame {
    id1: number;
    id2: number | null;
    ws1: websocket.WebSocket;
    ws2: websocket.WebSocket | null;
    state: GameState;
    intervalId: NodeJS.Timeout | null;
}

interface WaitingPlayer {
    id: number;
    socket: websocket.WebSocket;
}

const activeGames = new Map<number, OnlineGame>();
let waitingPlayer: WaitingPlayer | null = null;

async function registerMatch(game: OnlineGame) {
    const date = Math.floor(Date.now() / 1000);

    const result = await db.insert(matchHistory).values({
        userId: game.id1,
        mode: "online",
        playerLeft: game.state.players.left,
        scoreLeft: game.state.scores.left,
        playerRight: game.state.players.right,
        scoreRight: game.state.scores.right,
        userplace: "left",
        date,
    }).returning();

    if (result.length === 0) {
        console.error("DB error: match insertion failed for player 1");
    }

    if (game.id2) {
        const result2 = await db.insert(matchHistory).values({
            userId: game.id2,
            mode: "online",
            playerLeft: game.state.players.left,
            scoreLeft: game.state.scores.left,
            playerRight: game.state.players.right,
            scoreRight: game.state.scores.right,
            userplace: "right",
            date,
        }).returning();

        if (result2.length === 0) {
            console.error("DB error: match insertion failed for player 2");
        }
    }
}

function sendCountdown(game: OnlineGame, socket: websocket.WebSocket) {
    setTimeout(() => {
        socket.send(JSON.stringify({ type: "countdown", value: 3 }));
        game.ws1.send(JSON.stringify({ type: "countdown", value: 3 }));
    }, 0);

    setTimeout(() => {
        socket.send(JSON.stringify({ type: "countdown", value: 2 }));
        game.ws1.send(JSON.stringify({ type: "countdown", value: 2 }));
    }, 1000);

    setTimeout(() => {
        socket.send(JSON.stringify({ type: "countdown", value: 1 }));
        game.ws1.send(JSON.stringify({ type: "countdown", value: 1 }));
    }, 2000);

    setTimeout(() => {
        socket.send(JSON.stringify({ type: "countdown", value: 0 }));
        game.ws1.send(JSON.stringify({ type: "countdown", value: 0 }));
    }, 3000);
}

function setupSocketListeners(game: OnlineGame, socket: websocket.WebSocket) {
    socket.on("message", (data) => {
        const msg = JSON.parse(data.toString());

        if (msg.type === "pause") {
            if (game.state.status === "playing") {
                game.state.status = "paused2";
                socket.send(JSON.stringify({ type: "pause" }));
                game.ws1.send(JSON.stringify({ type: "pause" }));
            } else if (game.state.status === "paused2") {
                game.state.status = "playing";
            }
        } else {
            game.state.paddle2.dy = msg.dy;
        }
    });

    socket.on("close", () => {
        game.ws1.send(JSON.stringify({ type: "opponentDisconnected" }));
        if (game.intervalId != null) clearInterval(game.intervalId);
        activeGames.delete(game.id1);
    });

    game.ws1.on("close", () => {
        socket.send(JSON.stringify({ type: "opponentDisconnected" }));
        if (game.intervalId != null) clearInterval(game.intervalId);
        activeGames.delete(game.id1);
    });
}

function startGameLoop(game: OnlineGame, socket: websocket.WebSocket) {
    let lastTime = performance.now();

    sendCountdown(game, socket);

    setTimeout(() => {
        socket.send(JSON.stringify({ type: "countdown", value: 0 }));
        game.ws1.send(JSON.stringify({ type: "countdown", value: 0 }));

        game.intervalId = setInterval(() => {
            if (game.state.status !== "playing") return;

            const now = performance.now();
            const deltaMs = now - lastTime;
            lastTime = now;

            game.state = gameTick(game.state, deltaMs);

            if (isGameOver(game.state)) {
                socket.send(JSON.stringify({ type: "gameOver", scores: game.state.scores, players: game.state.players }));
                game.ws1.send(JSON.stringify({ type: "gameOver", scores: game.state.scores, players: game.state.players }));
                if (game.intervalId != null) clearInterval(game.intervalId);
                activeGames.delete(game.id1);
                registerMatch(game).catch((err) => console.error("DB error:", err));
                return;
            }

            socket.send(JSON.stringify(game.state));
            game.ws1.send(JSON.stringify(game.state));
        }, 60);
    }, 4200);

    setupSocketListeners(game, socket);
}

export function createPongWebsocketRoute() {
    fastify.register(async function (fastify) {
        fastify.get(
            "/ws/pong",
            { websocket: true },
            async (socket: websocket.WebSocket, request: FastifyRequest) => {
                const t = translate(request);
                try {
                    const { id } = extractUserIdHotJwt(t, request);

                    if (!waitingPlayer) {
                        // joueur 1
                        waitingPlayer = { id, socket };
                        socket.send(JSON.stringify({ type: "opponentWaiting" }));

                        socket.on("close", () => {
                            waitingPlayer = null;
                        });

                        socket.on("message", (data) => {
                            const game = activeGames.get(id);
                            if (!game) return;

                            const msg = JSON.parse(data.toString());

                            if (msg.type === "pause") {
                                if (game.state.status === "playing") {
                                    game.state.status = "paused1";
                                    socket.send(JSON.stringify({ type: "pause" }));
                                    if (game.ws2) {
                                        game.ws2.send(JSON.stringify({ type: "pause" }));
                                    }
                                } else if (game.state.status === "paused1") {
                                    game.state.status = "playing";
                                }
                            } else {
                                game.state.paddle1.dy = msg.dy;
                            }
                        });
                    } else {
                        // joueur 2
                        const game: OnlineGame = {
                            id1: waitingPlayer.id,
                            id2: id,
                            ws1: waitingPlayer.socket,
                            ws2: socket,
                            state: initGameState(),
                            intervalId: null,
                        };
                        activeGames.set(game.id1, game);
                        waitingPlayer = null;

                        const result1 = await db
                            .select({ username: users.username })
                            .from(users)
                            .where(eq(users.id, game.id1));

                        const result2 = await db
                            .select({ username: users.username })
                            .from(users)
                            .where(eq(users.id, id));

                        game.state.players.left = result1[0]?.username ?? "Player 1";
                        game.state.players.right = result2[0]?.username ?? "Player 2";

                        startGameLoop(game, socket);
                    }
                } catch (error: any) {
                    if (typeof error.code === "number" && error.message) {
                        console.error("WS Error : code : ", error.code, ", message : ", error.message);
                    } else {
                        console.error("WS Error : ", error);
                    }
                    socket.close();
                }
            }
        );
    });
}