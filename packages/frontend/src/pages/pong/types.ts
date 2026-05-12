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
  width: number;
  height: number;
  speed: number;
  dy: number;
}

export interface GameState {
  ball: BallState;
  paddle1: PaddleState;
  paddle2: PaddleState;
  players: {left: string; right: string };
  scores: { left: number; right: number };
}

export interface BallUpdateResult {
  ball: BallState;
  scored: "left" | "right" | null;  // null = personne n'a marqué
}