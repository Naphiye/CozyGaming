import type { GameState } from "./types";
import { drawOnlineScene, drawWinner } from "./drawOnlineScene";
import { drawBackground, drawPauseOverlay } from "../common/draw";
import { dico } from "../../../dico/larousse";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants";


export function drawCenteredText(
    ctx: CanvasRenderingContext2D,
    text: string
) {
    ctx.fillStyle = "#915D4D";
    ctx.textAlign = "center";
    ctx.font = "bold 50px capy-font";

    ctx.fillText(
        text,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2
    );
}

export function drawOnlineGame(
    canvas: HTMLCanvasElement,
    event: MessageEvent<any>,
    cleanup: () => void
) {
    const data = JSON.parse(event.data);

    const ctx = canvas.getContext("2d");
    if (!ctx)
        return cleanup();



    if (data.type === "opponentDisconnected") {
        drawCenteredText(ctx, dico.tRaw("opponentDisconnected"));
        cleanup();
        return;
    }

    if (data.type === "opponentWaiting") {
        drawCenteredText(ctx, dico.tRaw("opponentWaiting"));
        return;
    }

    if (data.type === "countdown") {
        drawBackground(ctx);

        if (data.value === 0)
            drawCenteredText(ctx, dico.tRaw("Go"));
        else
            drawCenteredText(ctx, `${data.value}`);

        return;
    }

    if (data.type === "pause") {
        drawPauseOverlay(ctx);
        return;
    }

    if (data.type === "gameOver") {
        drawWinner(ctx, data);
        cleanup();
        return;
    }

    drawOnlineScene(canvas, data as GameState);
}