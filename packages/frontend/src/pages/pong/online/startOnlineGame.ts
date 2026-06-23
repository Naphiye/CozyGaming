import { drawOnlineGame } from "./drawOnlineScene";
import { onKeyDown, onKeyUp } from "./keyboard";

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

