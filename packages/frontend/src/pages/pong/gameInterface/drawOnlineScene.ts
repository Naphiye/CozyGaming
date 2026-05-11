

import { GameState } from "../types";
import { PADDLE_HEIGHT, PADDLE_WIDTH, CANVAS_WIDTH, CANVAS_HEIGHT, BALL_RADIUS } from "../constants";
import { drawBackground } from "./drawParts";


export function drawOnlineScene(canvas: HTMLCanvasElement, game: GameState) {
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

    //DESSINER LA BALL 
    ctx.beginPath();
    ctx.arc(game.ball.x, game.ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#C16765";
    ctx.fill();
    ctx.closePath();

    //dessiner le score
    ctx.font = "bold 28px capy-font";
    ctx.fillStyle = "#C16765";
    ctx.textAlign = "center";
    ctx.fillText(`${game.scores.left} : ${game.scores.right}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.05);


}


