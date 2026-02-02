import { getPongGameHtml } from "./pongHtml.ts";
import type { GameMode } from "../gameLogic/gameConfig.ts";
import { dico } from "../../../dico/larousse.ts";
import { loadPage } from "../../DOM_helper.ts";
import { startGame } from "../gameLogic/startGame.ts";
import { navigate } from "../../../router.ts";
import { TournamentManager } from "../gameLogic/tournament.ts";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants.ts";


function setupCanvas(container: HTMLDivElement): HTMLCanvasElement | null {
  const canvas = container.querySelector<HTMLCanvasElement>("#pong-canvas");
  if (!canvas) {
    console.error("PongPlay: missing canvas");
    return null;
  }
  canvas.height = CANVAS_HEIGHT;
  canvas.width = CANVAS_WIDTH;
  return canvas;
}

function determineGameMode(players: string[]): { mode: GameMode; tournamentMgr: TournamentManager | null } {
  if (players[1] && !players[2]) return { mode: "classic", tournamentMgr: null };
  if (players[1] && players[2]) return { mode: "tournament", tournamentMgr: new TournamentManager(players) };
  return { mode: "ai", tournamentMgr: null };
}

function setupMenuButton(container: HTMLDivElement, cleanup: () => void, removeBackHandler: () => void) {
  const menuBtn = container.querySelector<HTMLButtonElement>("#menuReturn");
  if (menuBtn) menuBtn.addEventListener("click", () => {
    cleanup();              // stop game loop, remove keyboard/mouse listeners
    removeBackHandler();     // supprime le listener popstate temporaire
    navigate("/pong");       // retourne au menu
  });
}


function setupBackHandler(cleanup: () => void) {
  const handler = () => cleanup();
  window.addEventListener("popstate", handler);
  return () => window.removeEventListener("popstate", handler);
}


export function renderPongGame(container: HTMLDivElement, players: string[], username: string) {
  const footer = document.querySelector<HTMLDivElement>("footer");
  if (!footer) {
    console.error("Footer not found in DashboardPage");
    return;
  }
  footer.style.display = "none";
  loadPage(container);

  container.innerHTML = getPongGameHtml();
  dico.setLanguage(dico.getLanguage());

  const canvas = setupCanvas(container);
  if (!canvas) return;

  const { mode, tournamentMgr } = determineGameMode(players);
  const cleanup = startGame(canvas, players[0], players[1] || "", mode, username, tournamentMgr);

  const removeBackHandler = setupBackHandler(cleanup);
  setupMenuButton(container, cleanup, removeBackHandler);
}


