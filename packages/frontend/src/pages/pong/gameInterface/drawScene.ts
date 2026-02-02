import { Paddle } from "../gameObjects/paddle";
import { Ball } from "../gameObjects/ball";
import { Match } from "../gameObjects/match";
import type { GameMode } from "../gameLogic/gameConfig";
import { GameStateManager } from "../gameLogic/gameStateManager";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";
import { drawBackground, drawGameObjects, drawPauseOverlay, drawScore } from "./drawParts";
import { drawNextAnimation } from "./drawNextMatchScreen";
import { drawEndScreen } from "./drawEndScreen";
import { drawEndOfTournament } from "./drawEndScreen";


/* ------------------------------ MAIN DRAW FUNCTION ------------------------------ */

export function drawScene(
    canvas: HTMLCanvasElement,
    paddle1: Paddle,
    paddle2: Paddle,
    ball: Ball,
    match: Match,
    stateMgr: GameStateManager,
    isHovering: boolean,
    mode: GameMode,
) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 🧹 Efface tout le canvas à chaque frame
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 🎨 1️⃣ Toujours afficher le fond
    drawBackground(ctx);

    // 🎬 2️⃣ Gestion des états spécifiques
    switch (stateMgr.state) {
        case "nextMatchAnimation":
            // Animation d’intro entre deux matchs
            if (stateMgr.nextPlayers) {
                drawNextAnimation(ctx, stateMgr, mode);
            }
            break;

        case "endofTournament":
            // Écran  stateMde fin de tournoi (affiche scores aussi)
            drawEndOfTournament(ctx, match);
            drawScore(ctx, match);
            break;

        case "paused":
            // On garde les objets visibles en fond
            drawGameObjects(ctx, paddle1, paddle2, ball, stateMgr);
            drawScore(ctx, match);
            drawPauseOverlay(ctx);
            break;

        case "finished":
            // Fin de match : afficher scores + écran de fin
            drawEndScreen(ctx, match, isHovering, mode);
            drawScore(ctx, match);
            break;

        default:
            // État de jeu normal (match en cours)
            drawGameObjects(ctx, paddle1, paddle2, ball, stateMgr);
            drawScore(ctx, match);
            break;
    }
}

