import { initGameObjects } from "../gameObjects/init";
import { setupKeyboard } from "./keyboard";
import { createGameLoop } from "./createGameLoop";
import { GameConfig } from "./gameConfig";
import type { GameMode } from "./gameConfig";
import { TournamentManager } from "./tournament";

export function startGame(
  canvas: HTMLCanvasElement, playerLeft: string, playerRight: string,
  mode: GameMode, username: string, tournamentMgr: TournamentManager | null = null // peut être null
) {

  const { paddle1, paddle2, ball, match } = initGameObjects(mode, playerLeft, playerRight, username);

  const config = new GameConfig({
    canvas,
    paddle1,
    paddle2,
    ball,
    match,
    mode,
    tournamentMgr,
    username,
  });

  if (mode === "tournament" && tournamentMgr == null) {
    console.error("Lauching tournament failed")
    return () => { }; // always return a no-op cleanup
  }

  const { togglePause, cleanup } = createGameLoop(config);


  const removeKeyboard = setupKeyboard(paddle1, mode === "ai" ? null : paddle2, togglePause);


  return () => {
    removeKeyboard();
    cleanup();
  };
}
