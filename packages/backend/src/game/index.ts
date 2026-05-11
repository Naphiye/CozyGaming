import { GameState, BallState, PaddleState, BallUpdateResult } from "./types.js";
import { updateBall } from "./ball.js";
import { updatePaddle } from "./paddle.js";
import { PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_MARGIN, CANVAS_HEIGHT, CANVAS_WIDTH, PADDLE_SPEED, BALL_RADIUS, BALL_SPEED } from "./constants.js";


export function gameTick(state: GameState, deltaTime: number): GameState {


    const result = updateBall(state.ball, state.paddle1, state.paddle2, deltaTime);
    state.ball = result.ball;
    updatePaddle(state.paddle1, deltaTime);
    updatePaddle(state.paddle2, deltaTime);
    if (result.scored === "left") {
        state.scores.left += 1;
    }
    if (result.scored === "right") {
        state.scores.right += 1;
    }
    return state;

}

export function initGameState(): GameState {
    const paddle1: PaddleState = {
        x: PADDLE_MARGIN,
        y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, speed: PADDLE_SPEED, dy: 0
    }


    const paddle2: PaddleState = {
        x: CANVAS_WIDTH - PADDLE_WIDTH - PADDLE_MARGIN,
        y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, speed: PADDLE_SPEED, dy: 0
    }

    const angle = (Math.random() * Math.PI) / 4 - Math.PI / 8; // entre -22° et 22°
    const dir = Math.random() > 0.5 ? 1 : -1; // gauche ou droite


    const ball: BallState = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        dx: Math.cos(angle) * BALL_SPEED * dir,
        dy: Math.sin(angle) * BALL_SPEED,
        radius : BALL_RADIUS,
        speed : BALL_SPEED
    }

    return { ball, paddle1, paddle2, scores : {left : 0, right: 0}}

}