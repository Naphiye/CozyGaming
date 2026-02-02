import { dico } from "../../../dico/larousse";
import type { GameMode } from "../gameLogic/gameConfig";
import { GameStateManager } from "../gameLogic/gameStateManager";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";



const NEXT_ANIM_UI = {
    titleScale: 0.12,        // Taille du titre "Next Match"
    nameScale: 0.075,         // Taille des pseudos
    vsScale: 0.075,           // Taille du VS
    countdownScale: 0.15,    // Taille du chiffre de countdown
    goScale: 0.185,           // Taille du "GO"

    topMarginScale: 0.09,    // Distance du haut pour le titre
    verticalSpacingScale: 0.15, // Espacement entre les lignes joueurs / VS
    marginScale: 0.04,       // Ajustement vertical léger
    bottomCountdownScale: 0.13 // Distance à partir du bas pour le countdown
};


function createNextAnimationLayout(mode: GameMode) {
    return {
        titleFont: CANVAS_HEIGHT * NEXT_ANIM_UI.titleScale,
        nameFont: CANVAS_HEIGHT * NEXT_ANIM_UI.nameScale,
        vsFont: CANVAS_HEIGHT * NEXT_ANIM_UI.vsScale,
        countdownFont: CANVAS_HEIGHT * NEXT_ANIM_UI.countdownScale,
        goFont: CANVAS_HEIGHT * NEXT_ANIM_UI.goScale,

        topMargin: CANVAS_HEIGHT * NEXT_ANIM_UI.topMarginScale,
        spacing: CANVAS_HEIGHT * NEXT_ANIM_UI.verticalSpacingScale,
        margin: CANVAS_HEIGHT * NEXT_ANIM_UI.marginScale,

        centerX: CANVAS_WIDTH / 2,
        middleY: CANVAS_HEIGHT / 2,

        countdownY:
            mode === "tournament"
                ? CANVAS_HEIGHT - CANVAS_HEIGHT * NEXT_ANIM_UI.bottomCountdownScale
                : CANVAS_HEIGHT / 2
    };
}

function drawGoScreen(ctx: CanvasRenderingContext2D, layout: any) {
    ctx.fillStyle = "#fff6ef";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "#915D4D";
    ctx.font = `${layout.goFont}px capy-font`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(dico.tRaw("Go"), layout.centerX, layout.middleY);
}

function drawCountdown(ctx: CanvasRenderingContext2D, countdown: number, layout: any) {
    ctx.font = `${layout.countdownFont}px capy-font`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    ctx.fillText(`${countdown}`, layout.centerX, layout.countdownY);
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    if (ctx.measureText(text).width <= maxWidth) return text;

    let truncated = text;
    while (ctx.measureText(truncated + "…").width > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
    }
    return truncated + "…";
}


function drawTournamentInfo(
    ctx: CanvasRenderingContext2D,
    stateMgr: GameStateManager,
    layout: any
) {
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = `${layout.titleFont}px capy-font`;
    ctx.fillText(dico.tRaw("NextMatch"), layout.centerX, layout.topMargin);

    if (!stateMgr.nextPlayers) return;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${layout.nameFont}px capy-font`;

    const left = stateMgr.nextPlayers[0];
    const right = stateMgr.nextPlayers[1];

    const maxWidth = CANVAS_WIDTH * 0.4; // Responsive max width
    const leftName = truncateText(ctx, left, maxWidth);
    const rightName = truncateText(ctx, right, maxWidth);

    ctx.fillText(leftName, layout.centerX, layout.middleY - layout.margin - layout.spacing);
    ctx.font = `${layout.vsFont}px capy-font`;
    ctx.fillText("VS", layout.centerX, layout.middleY - layout.margin);
    ctx.font = `${layout.nameFont}px capy-font`;
    ctx.fillText(rightName, layout.centerX, layout.middleY - layout.margin + layout.spacing);
}



export function drawNextAnimation(
    ctx: CanvasRenderingContext2D,
    stateMgr: GameStateManager,
    mode: GameMode
) {
    const layout = createNextAnimationLayout(mode);

    const elapsedMs = performance.now() - stateMgr.animationStart;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const countdown = 3 - elapsedSeconds;

    // Fond beige
    ctx.fillStyle = "#fff6ef";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "#915D4D";

    // Titre + Joueurs (mode tournoi uniquement)
    if (mode === "tournament") {
        drawTournamentInfo(ctx, stateMgr, layout);
    }

    // Compte à rebours
    if (countdown > 0) {
        drawCountdown(ctx, countdown, layout);
    }

    // "GO!"
    if (elapsedSeconds === 3) {
        drawGoScreen(ctx, layout);
    }

    // Transition vers le jeu
    if (elapsedSeconds >= 4) {
        stateMgr.resetGame();
        stateMgr.state = "starting";
    }
}


