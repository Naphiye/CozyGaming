
import { Paddle } from "./paddle";
import { Ball } from "./ball";
import { Match } from "./match";
import type { GameMode } from "../gameLogic/gameConfig";
import {
  PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN,
  CANVAS_HEIGHT,
  CANVAS_WIDTH
} from "../constants";

export function initGameObjects(
  mode: GameMode,
  playerLeft: string,
  playerRight: string, username: string) {

  const paddle1 = new Paddle(
    PADDLE_MARGIN,
    (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
  );

  const paddle2 = new Paddle(
    CANVAS_WIDTH - PADDLE_WIDTH - PADDLE_MARGIN,
    (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
  );

  const ball = new Ball();

  // player left ? player right 
  let userplace;
  if (playerLeft == username) {
    userplace = "left";
  }
  else if (playerRight == username) {
    userplace = "right";
  }
  else {
    userplace = "none";
  }
  const match = new Match(playerLeft, mode === "ai" ? "AI" : playerRight, mode, userplace);
  return { paddle1, paddle2, ball, match }
};