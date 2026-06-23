
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


export function onKeyDown(e: KeyboardEvent, ws: WebSocket, keysPressed: Set<string>) {
    const keysToBlock = ["ArrowUp", "ArrowDown", " ", "w", "s"];
    if (keysToBlock.includes(e.key)) e.preventDefault();
    if (e.key === " ") {
        ws.send(JSON.stringify({ type: "pause" }));
        return;
    }
    keysPressed.add(e.key);
    updateMovement(ws, keysPressed);
}

export function onKeyUp(e: KeyboardEvent, ws: WebSocket, keysPressed: Set<string>) {
    const keysToBlock = ["ArrowUp", "ArrowDown", " ", "w", "s"];
    if (keysToBlock.includes(e.key)) e.preventDefault();
    keysPressed.delete(e.key);

    updateMovement(ws, keysPressed);
}
