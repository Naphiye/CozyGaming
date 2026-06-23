import { dico } from "../../../dico/larousse";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";



/* ------------------------------ PARTIAL DRAW export FUNCTIONS ------------------------------ */

export function drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#fff6ef"; // fond légèrement beige
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

export function drawPauseOverlay(ctx: CanvasRenderingContext2D) {
    ctx.font = "80px capy-font";
    ctx.fillStyle = "#915D4D";
    ctx.textAlign = "center";
    ctx.fillText(dico.tRaw("Pause"), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}



