import { GameState } from "../types";

export function startOnlineGame(canvas: HTMLCanvasElement)
{
const ws = new WebSocket(`/api/ws/pong`);

ws.onopen = () => {
    console.log("pong WS connected");
};

// 3. Quand on reçoit un message
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const game: GameState = data;
    drawScene(canvas, game.paddle1, game.paddle2, game.ball, )
    
};

// 4. Envoyer un message
ws.send(JSON.stringify({ dy: 1 }));

// 5. Fermer la connexion
ws.close();



}

