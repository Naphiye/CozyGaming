export interface BallState {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
}

export interface PaddleState {
  x: number;
  y: number;
}

export interface GameState {
  ball: BallState;
  paddle1: PaddleState;
  paddle2: PaddleState;
  scores: { left: number; right: number };
}