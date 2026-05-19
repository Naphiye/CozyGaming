import type { GameState } from "../types";
import { drawOnlineScene } from "../gameInterface/drawOnlineScene";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";
import { dico } from "../../../dico/larousse";


interface GameOverData {
    type: "gameOver";
    scores: { left: number; right: number };
    players: { left: string; right: string };
}


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
    if (e.key === " ") {
        ws.send(JSON.stringify({ type: "pause" }));
        return;
    }
    keysPressed.add(e.key);
    updateMovement(ws, keysPressed);
}

function onKeyUp(e: KeyboardEvent, ws: WebSocket, keysPressed: Set<string>) {
    const keysToBlock = ["ArrowUp", "ArrowDown", " ", "w", "s"];
    if (keysToBlock.includes(e.key)) e.preventDefault();
    keysPressed.delete(e.key);

    updateMovement(ws, keysPressed);
}


function drawWinner(canvas: HTMLCanvasElement, cleanup: ()=> void, data: GameOverData) {

    //recuperation du canva
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return cleanup();

    ctx.fillStyle = "#fff6ef";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const winnerAlias = data.scores.left > data.scores.right ? data.players.left : data.players.right;
    const label = dico.tRaw("winner") + " ";
    // Mesurer la largeur du label
    ctx.font = "bold 50px capy-font";
    const labelWidth = ctx.measureText(label).width;

    // Largeur max restante pour le pseudo
    const maxPseudoWidth = CANVAS_WIDTH * 0.8 - labelWidth;

    // Tronquer correctement le pseudo
    let displayedPseudo = winnerAlias;
    let chars = Array.from(winnerAlias);
    while (ctx.measureText(chars.join("") + "…").width > maxPseudoWidth && chars.length > 1) {
        chars.pop();
    }
    if (chars.length < winnerAlias.length) {
        displayedPseudo = chars.join("") + "…";
    }

    // Affichage final
    ctx.fillStyle = "#915D4D";
    ctx.textAlign = "center";
    ctx.font = "bold 50px capy-font";
    ctx.fillText(label + displayedPseudo, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}

function drawOnlineGame(canvas: HTMLCanvasElement,  event: MessageEvent<any>, cleanup: () => void) {
    const data = JSON.parse(event.data);

    //recuperation du canva
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return cleanup();

    if (data.type === "opponentDisconnected") {
        ctx.fillStyle = "#fff6ef";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#915D4D";
        ctx.textAlign = "center";
        ctx.font = "bold 50px capy-font";
        ctx.fillText(dico.tRaw("opponentDisconnected"), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        return cleanup();
    }
    else if (data.type === "opponentWaiting") {
        ctx.fillStyle = "#915D4D";
        ctx.textAlign = "center";
        ctx.font = "bold 50px capy-font";
        ctx.fillText(dico.tRaw("opponentWaiting"), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
    else if (data.type === "countdown") {
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
    else if (data.type === "pause") {
        ctx.fillStyle = "#915D4D";
        ctx.font = `300px capy-font`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle"
        ctx.fillText(dico.tRaw("Pause"), CANVAS_WIDTH / 2, (CANVAS_HEIGHT / 2));

    }
    else if (data.type === "gameOver") {
        drawWinner(canvas, cleanup, data);
        return cleanup();
    }
    else {
        const game: GameState = data;
        drawOnlineScene(canvas, game);
    }

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

        drawOnlineGame(canvas, event, cleanup);

    };
    return cleanup;
}

