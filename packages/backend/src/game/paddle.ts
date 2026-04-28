import { CANVAS_HEIGHT, PADDLE_HEIGHT }
    from "./constants.js";
import { PaddleState } from "./types.js";

export function updatePaddle(paddle: PaddleState, deltaTime: number): PaddleState {

    paddle.y += paddle.dy * deltaTime;

    // rester dans le canvas
    if (paddle.y < 0) paddle.y = 0;
    if (paddle.y + PADDLE_HEIGHT > CANVAS_HEIGHT)
        paddle.y = CANVAS_HEIGHT - PADDLE_HEIGHT;

    return paddle;
}
