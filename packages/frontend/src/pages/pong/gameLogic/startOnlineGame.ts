import { GameState } from "../types";
import { drawOnlineScene } from "../gameInterface/drawOnlineScene";



function updateMovement(ws: WebSocket, keysPressed: Set<string>) {
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

    // 3. Quand on reçoit un message
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const game: GameState = data;
        drawOnlineScene(canvas, game);

    };

    const keyDownHandler = (e: KeyboardEvent) => onKeyDown(e, ws, keysPressed);
    const keyUpHandler = (e: KeyboardEvent) => onKeyUp(e, ws, keysPressed);
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    return () => {
        document.removeEventListener("keydown", keyDownHandler);
        document.removeEventListener("keyup", keyUpHandler);
        ws.close();
    };

}

