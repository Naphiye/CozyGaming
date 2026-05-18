import type { GameState } from "../types";
import { drawOnlineScene } from "../gameInterface/drawOnlineScene";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";
import { dico } from "../../../dico/larousse";



function updateMovement(ws: WebSocket, keysPressed: Set<string>) {
    if (ws.readyState !== WebSocket.OPEN) return;
    // Paddle 1
    if (keysPressed.has("w") || keysPressed.has("ArrowUp")) {

        ws.send(JSON.stringify({ dy: -1 }));

    }
    else if (keysPressed.has("s") || keysPressed.has("ArrowDown")) {
        ws.send(JSON.stringify({ dy: 1 }));
    }
    else {
        ws.send(JSON.stringify({ dy: 0 }));

    }
}


function onKeyDown(e: KeyboardEvent, ws: WebSocket, keysPressed: Set<string>) {
    const keysToBlock = ["ArrowUp", "ArrowDown", " ", "w", "s"];
    if (keysToBlock.includes(e.key)) e.preventDefault();
    keysPressed.add(e.key);
    updateMovement(ws, keysPressed);
}

function onKeyUp(e: KeyboardEvent, ws: WebSocket, keysPressed: Set<string>) {
    const keysToBlock = ["ArrowUp", "ArrowDown", " ", "w", "s"];
    if (keysToBlock.includes(e.key)) e.preventDefault();

    keysPressed.delete(e.key);

    updateMovement(ws, keysPressed);
}


export function startOnlineGame(canvas: HTMLCanvasElement) {
    const ws = new WebSocket(`/api/ws/pong`);
    const keysPressed = new Set<string>();

    ws.onopen = () => {
        console.log("pong WS connected");
    };


    const keyDownHandler = (e: KeyboardEvent) => onKeyDown(e, ws, keysPressed);
    const keyUpHandler = (e: KeyboardEvent) => onKeyUp(e, ws, keysPressed);
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    const cleanup = () => {
        document.removeEventListener("keydown", keyDownHandler);
        document.removeEventListener("keyup", keyUpHandler);
        ws.close();
    };

    // 3. Quand on reçoit un message
    ws.onmessage = (event) => {

        const data = JSON.parse(event.data);
        if (data.type === "opponentDisconnected") {

            const ctx = canvas.getContext("2d");
            if (!ctx)
                return cleanup();
            ctx.fillStyle = "#fff6ef";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = "#915D4D";
            ctx.textAlign = "center";
            ctx.font = "bold 50px capy-font";
            ctx.fillText("Player disconnected", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            return cleanup();
        }
        else if (data.type === "opponentWaiting") {

            const ctx = canvas.getContext("2d");
            if (!ctx)
                return cleanup();
            ctx.fillStyle = "#915D4D";
            ctx.textAlign = "center";
            ctx.font = "bold 50px capy-font";
            ctx.fillText("Waiting for an adversaire", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        }
        else if (data.type === "countdown") {
            const ctx = canvas.getContext("2d");
            if (!ctx)
                return cleanup();
            ctx.fillStyle = "#fff6ef";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = "#915D4D";
            ctx.font = `300px capy-font`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle"
            if (data.value === 0) {
                ctx.fillText(dico.tRaw("Go"), CANVAS_WIDTH / 2, (CANVAS_HEIGHT / 2));
            }
            else {
                ctx.fillText(`${data.value}`, CANVAS_WIDTH / 2, (CANVAS_HEIGHT / 2));
            }
        }
        else {
            const game: GameState = data;
            drawOnlineScene(canvas, game);
        }

    };

    return cleanup;

}

