import { GameState, BallUpdateResult } from "./types.js";
import { updateBall } from "./ball.js";
import { updatePaddle } from "./paddle.js";


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