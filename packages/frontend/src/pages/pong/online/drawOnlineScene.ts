import type { GameState } from "./types";
import { PADDLE_HEIGHT, PADDLE_WIDTH, CANVAS_WIDTH, CANVAS_HEIGHT, BALL_RADIUS } from "../constants";
import { drawBackground } from "../common/draw";
import { dico } from "../../../dico/larousse";
import { drawPauseOverlay } from "../common/draw";

interface GameOverData {
    type: "gameOver";
    scores: { left: number; right: number };
    players: { left: string; right: string };
}



export function drawOnlineGame(canvas: HTMLCanvasElement, event: MessageEvent<any>, cleanup: () => void) {
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
        drawPauseOverlay(ctx);

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


function drawOnlineScene(canvas: HTMLCanvasElement, game: GameState) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawBackground(ctx);

    //dessiner le paddle 1 : 
    const radius = 5; // rayon des coins arrondis
    ctx.fillStyle = "#C16765";
    ctx.beginPath();
    ctx.roundRect(game.paddle1.x, game.paddle1.y, PADDLE_WIDTH, PADDLE_HEIGHT, radius);
    ctx.fill();


    //dessiner le paddle 12: 
    ctx.fillStyle = "#C16765";
    ctx.beginPath();
    ctx.roundRect(game.paddle2.x, game.paddle2.y, PADDLE_WIDTH, PADDLE_HEIGHT, radius);
    ctx.fill();

    //dessiner la balle
    ctx.beginPath();
    ctx.arc(game.ball.x, game.ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#C16765";
    ctx.fill();
    ctx.closePath();

    //dessiner le scores 
    ctx.font = "bold 28px capy-font";
    ctx.fillStyle = "#C16765";
    ctx.textAlign = "center";
    ctx.fillText(`${game.scores.left} : ${game.scores.right}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.05);

    //dessiner les pseudos
    ctx.fillText(game.players.right, (CANVAS_WIDTH * 3) / 4, CANVAS_HEIGHT * 0.05);
    ctx.fillText(game.players.left, CANVAS_WIDTH / 4, CANVAS_HEIGHT * 0.05);

}



function drawWinner(canvas: HTMLCanvasElement, cleanup: () => void, data: GameOverData) {

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