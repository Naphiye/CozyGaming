import { CANVAS_HEIGHT, PADDLE_HEIGHT, PADDLE_SPEED }
    from "./constants.js";
import type { PaddleState } from "./types.js";

export function updatePaddle(paddle: PaddleState, deltaTime: number): PaddleState {

    paddle.y += paddle.dy * PADDLE_SPEED * deltaTime;;

    // rester dans le canvas
    if (paddle.y < 0) paddle.y = 0;
    if (paddle.y + PADDLE_HEIGHT > CANVAS_HEIGHT)
        paddle.y = CANVAS_HEIGHT - PADDLE_HEIGHT;

    return paddle;
}
