// GameConfig.ts
import { Paddle } from "../gameObjects/paddle";
import { Ball } from "../gameObjects/ball";
import { Match } from "../gameObjects/match";
import { TournamentManager } from "./tournament";

export type GameMode = "classic" | "ai" | "tournament";

export interface GameConfigOptions {
  canvas: HTMLCanvasElement;
  paddle1: Paddle;
  paddle2: Paddle;
  ball: Ball;
  match: Match;
  mode?: GameMode;
  tournamentMgr?: TournamentManager | null; // facultatif ou null
  username: string;
}

export class GameConfig {
  canvas: HTMLCanvasElement;
  paddle1: Paddle;
  paddle2: Paddle;
  ball: Ball;
  match: Match;
  mode: GameMode;
  tournamentMgr: TournamentManager | null;
  username: string;

  constructor(options: GameConfigOptions) {
    this.canvas = options.canvas;
    this.paddle1 = options.paddle1;
    this.paddle2 = options.paddle2;
    this.ball = options.ball;
    this.match = options.match;
    this.mode = options.mode ?? "classic";
    this.tournamentMgr = options.tournamentMgr ?? null; // si pas fourni, null
    this.username = options.username;
  }


  get aiMode() {
    return this.mode === "ai";
  }

  get tournamentMode() {
    return this.mode === "tournament";
  }
}
