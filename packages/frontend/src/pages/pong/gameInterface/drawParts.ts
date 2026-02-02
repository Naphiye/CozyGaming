import { Paddle } from "../gameObjects/paddle";
import { Ball } from "../gameObjects/ball";
import { Match } from "../gameObjects/match";
import { dico } from "../../../dico/larousse";
import { GameStateManager } from "../gameLogic/gameStateManager";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";



/* ------------------------------ PARTIAL DRAW export FUNCTIONS ------------------------------ */

export function drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#fff6ef"; // fond légèrement beige
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

export function drawGameObjects(
    ctx: CanvasRenderingContext2D,
    paddle1: Paddle,
    paddle2: Paddle,
    ball: Ball,
    stateMgr: GameStateManager
) {

    if (stateMgr.state !== "starting") ball.draw(ctx);
    paddle1.draw(ctx);
    paddle2.draw(ctx);

}

export function drawScore(ctx: CanvasRenderingContext2D, match: Match) {
    match.draw(ctx);
}

export function drawPauseOverlay(ctx: CanvasRenderingContext2D) {
    ctx.font = "80px capy-font";
    ctx.fillStyle = "#915D4D";
    ctx.textAlign = "center";
    ctx.fillText(dico.tRaw("Pause"), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}



