import { dico } from "../../../dico/larousse";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";
import type { GameMode } from "../gameLogic/gameConfig";

export class Match {
    playerLeft: string;
    playerRight: string;
    scoreLeft = 0;
    scoreRight = 0;
    userplace: string;
    date = 0;
    mode: GameMode;

    constructor(playerLeft: string, playerRight: string, mode: GameMode, userplace: string) {
        this.playerRight = playerRight;
        this.playerLeft = playerLeft;
        this.userplace = userplace;
        this.mode = mode;
    }

    addPoint(player: "left" | "right") {
        if (player === "left") this.scoreLeft++;
        else this.scoreRight++;
    }

    isGameOver(): boolean {
        return (
            ((this.scoreLeft >= 11 || this.scoreRight >= 11) &&
                Math.abs(this.scoreLeft - this.scoreRight) >= 2) ||
            this.scoreLeft >= 13 ||
            this.scoreRight >= 13
        );
    }

    getWinnerAlias(): string {
        return this.scoreLeft > this.scoreRight ? this.playerLeft : this.playerRight;
    }

    // 🔹 Fonction générique pour dessiner un texte qui s'adapte à la largeur
    drawTextAdaptive(
        ctx: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        baseFontSize = 50,
        fontName = "capy-font",
        fillStyle = "#915D4D",
        textAlign: CanvasTextAlign = "center"
    ) {
        ctx.fillStyle = fillStyle;
        ctx.textAlign = textAlign;

        let fontSize = baseFontSize;
        let displayed = text;
        ctx.font = `bold ${fontSize}px ${fontName}`;

        // Réduction progressive de la taille si trop large
        while (ctx.measureText(displayed).width > maxWidth && fontSize > 12) {
            fontSize--;
            ctx.font = `bold ${fontSize}px ${fontName}`;
        }

        // Tronquer correctement avec "…" en gérant les surrogate pairs
        if (ctx.measureText(displayed).width > maxWidth) {
            let chars = Array.from(displayed); // découpe en vrais caractères Unicode
            while (ctx.measureText(chars.join("") + "…").width > maxWidth && chars.length > 1) {
                chars.pop();
            }
            displayed = chars.join("") + "…";
        }

        ctx.fillText(displayed, x, y);
    }

    // 🔹 Dessine le texte du gagnant
    drawWinnerAlias(ctx: CanvasRenderingContext2D) {
        const winnerAlias = this.getWinnerAlias();
        const label = dico.tRaw("winner") + " ";

        // Mesurer la largeur du label
        ctx.font = "bold 50px capy-font";
        const labelWidth = ctx.measureText(label).width;

        // Largeur max restante pour le pseudo
        const maxPseudoWidth = CANVAS_WIDTH * 0.8 - labelWidth;

        // Tronquer correctement le pseudo
        let displayedPseudo = winnerAlias;
        let chars = Array.from(winnerAlias);
        while (ctx.measureText(chars.join("") + "…").width > maxPseudoWidth && chars.length > 1) {
            chars.pop();
        }
        if (chars.length < winnerAlias.length) {
            displayedPseudo = chars.join("") + "…";
        }

        // Affichage final
        ctx.fillStyle = "#915D4D";
        ctx.textAlign = "center";
        ctx.font = "bold 50px capy-font";
        ctx.fillText(label + displayedPseudo, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    // 🔹 Draw classique (score et pseudos)
    draw(ctx: CanvasRenderingContext2D) {

        // 🎯 Hauteur dynamique : espace réservé en haut de l'écran
        const topMargin = CANVAS_HEIGHT * 0.05;   // 5% de la hauteur
        const lineSpacing = CANVAS_HEIGHT * 0.02; // espacement vertical entre les lignes

        // 🏅 Score centré un peu plus bas
        this.drawTextAdaptive(
            ctx,
            `${this.scoreLeft} : ${this.scoreRight}`,
            CANVAS_WIDTH / 2,
            topMargin + lineSpacing,
            CANVAS_WIDTH / 3,
            Math.max(CANVAS_WIDTH * 0.04, 28), // taille adaptative
            "capy-font",
            "#C16765"
        );

        // 🧍‍♂️🧍‍♀️ Pseudos (un peu plus haut)
        this.drawTextAdaptive(
            ctx,
            this.playerLeft,
            CANVAS_WIDTH / 4,
            topMargin,
            CANVAS_WIDTH / 3,
            Math.max(CANVAS_WIDTH * 0.03, 22),
            "capy-font",
            "#915D4D"
        );
        this.drawTextAdaptive(
            ctx,
            this.playerRight,
            (CANVAS_WIDTH * 3) / 4,
            topMargin,
            CANVAS_WIDTH / 3,
            Math.max(CANVAS_WIDTH * 0.03, 22),
            "capy-font",
            "#915D4D"
        );
    }


    resetScore() {
        this.scoreLeft = 0;
        this.scoreRight = 0;
    }

    setPlayers(match: { playerLeft: string; playerRight: string, userplace: string }) {
        this.playerLeft = match.playerLeft;
        this.playerRight = match.playerRight;
        this.userplace = match.userplace;
    }
}
