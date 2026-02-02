import { Ball } from "../gameObjects/ball.ts";
import { Paddle } from "../gameObjects/paddle.ts";
import { Match } from "../gameObjects/match.ts";

export class GameStateManager {
  state: "starting" | "playing" | "paused" | "finished" | "nextMatchAnimation" | "endofTournament" = "starting";
  winnerAlias = "";
  startTimer = 0;
  match: Match;
  ball: Ball;
  paddle1: Paddle;
  paddle2: Paddle;
  canvas: HTMLCanvasElement;


  // ✨ pour l’animation Next Match
  nextPlayers: [string, string] | null = null;  // joueurs à afficher
  animationStart: number = 0;                   // timestamp début animation
  animationDuration: number = 3000;             // durée animation par défaut (ms)

  constructor(
    match: Match,
    ball: Ball,
    paddle1: Paddle,
    paddle2: Paddle,
    canvas: HTMLCanvasElement
  ) {
    this.match = match;
    this.ball = ball;
    this.paddle1 = paddle1;
    this.paddle2 = paddle2;
    this.canvas = canvas;
  }


  togglePause() {
    if (this.state === "playing" || this.state === "paused") {
      this.state = this.state === "paused" ? "playing" : "paused";
    }
  }


  resetGame() {
    this.state = "starting";
    this.winnerAlias = "";
    this.startTimer = 0;
    this.nextPlayers = null;
    this.animationStart = 0;

    this.match.resetScore();
    this.ball.reset();
    this.paddle1.reset();
    this.paddle2.reset();
  }

  // ✨ méthode helper pour lancer l’animation Next Match
  startNextMatchAnimation(playerLeft: string, playerRight: string, durationMs = 3000) {
    this.state = "nextMatchAnimation";
    this.nextPlayers = [playerLeft, playerRight];
    this.animationStart = performance.now();
    this.animationDuration = durationMs;
  }
}
