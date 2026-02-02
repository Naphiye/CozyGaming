import { Match } from "../gameObjects/match";
import { dico } from "../../../dico/larousse";
import type { GameMode } from "../gameLogic/gameConfig";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";


// 💄 Paramètres UI basés sur des proportions
const UI = {
    fontScale: 0.03,
    paddingXScale: 0.04,
    paddingYScale: 0.025,
    cornerRadiusScale: 0.015,
    offsetYScale: 0.15
};

// ---------------------------------------------------------
// 1️⃣  CreateEndButton → calcule les dimensions du bouton
// ---------------------------------------------------------
function createEndButton(
    ctx: CanvasRenderingContext2D,
    text: string
) {
    // Échelle responsive
    const fontSize = CANVAS_WIDTH * UI.fontScale;
    const paddingX = CANVAS_WIDTH * UI.paddingXScale;
    const paddingY = CANVAS_HEIGHT * UI.paddingYScale;
    const cornerRadius = CANVAS_WIDTH * UI.cornerRadiusScale;
    const offsetY = CANVAS_HEIGHT * UI.offsetYScale;

    // Police pour mesurer le texte
    ctx.font = `${fontSize}px capy-font`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textWidth = ctx.measureText(text).width;

    // Dimensions du bouton
    const width = textWidth + paddingX * 2;
    const height = fontSize + paddingY * 2;

    // Position centrée
    const x = (CANVAS_WIDTH - width) / 2;
    const y = CANVAS_HEIGHT / 2 + offsetY;

    return { x, y, width, height, fontSize, cornerRadius };
}

// ---------------------------------------------------------
// 2️⃣ DrawEndButton → dessine le bouton créé
// ---------------------------------------------------------
function drawEndButton(
    ctx: CanvasRenderingContext2D,
    text: string,
    isHovering: boolean
) {
    const btn = createEndButton(ctx, text);

    // Dessin du bouton
    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.width, btn.height, btn.cornerRadius);
    ctx.fillStyle = isHovering ? "#c16665be" : "#c16665ff";
    ctx.fill();

    // Texte
    ctx.fillStyle = "#fff6ef";
    ctx.fillText(text, CANVAS_WIDTH / 2, btn.y + btn.height / 2);
}

// ---------------------------------------------------------
// 3️⃣ drawEndScreen → utilise drawEndButton
// ---------------------------------------------------------
export function drawEndScreen(
    ctx: CanvasRenderingContext2D,
    match: Match,
    isHovering: boolean,
    mode: GameMode
) {
    match.drawWinnerAlias(ctx);

    const text = dico.tRaw(mode === "tournament" ? "NextMatch" : "Restart");

    drawEndButton(ctx, text, isHovering);
}

export function drawEndOfTournament(ctx: CanvasRenderingContext2D, match: Match) {
    ctx.fillStyle = "#fff6ef";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.font = "60px capy-font";
    ctx.fillStyle = "#915D4D";
    ctx.fillText(dico.tRaw("TournamentOver"), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 120);
    match.drawWinnerAlias(ctx);
}


