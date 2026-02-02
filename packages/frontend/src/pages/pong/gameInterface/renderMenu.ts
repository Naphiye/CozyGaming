import { safeFetch } from "./fetchGame.ts";
import { dico } from "../../../dico/larousse.ts";
import { loadPage } from "../../DOM_helper.ts";
import { navigate } from "../../../router.ts";
import { fetchPongStats } from "../pongStat/fetchPongStat.ts";
import { openPongGuestModal, openTournamentModal } from "./modalMenu.ts";
import { getPongMenuHtml } from "./pongHtml.ts";
import { renderPongGame } from "./renderGame.ts";
import { renderPongStats } from "../pongStat/renderPongStat.ts";
import { navbar } from "../../utils/navbar/navbar.ts";
import { fetchUserMe } from "../../profile/utils/fetch.ts";

function getElement<T extends HTMLElement>(container: HTMLElement, selector: string): T | null {
    return container.querySelector<T>(selector);
}

export async function renderPongMenu(container: HTMLDivElement) {
        const footer = document.querySelector<HTMLDivElement>("footer");
    if (!footer) {
        console.error("Footer not found in DashboardPage");
        return;
    }
    footer.style.display = "none";
    loadPage(container);


    // Récupère l'utilisateur
    const user = await safeFetch(fetchUserMe, "/", "Impossible de récupérer l'utilisateur");
    if (!user) return;
    const { username } = user;
    const players: string[] = [username, "", "", ""];

    // Récupère les stats
    const stats = await fetchPongStats(username);

    // Affiche le menu
    container.innerHTML = getPongMenuHtml();
    dico.setLanguage(dico.getLanguage());
    navbar(container, "pongBtn");

    // Affiche les stats
    renderPongStats(container, stats);
    footer.style.display = "block";

    // Récupère les boutons
    const playGuestBtn = getElement<HTMLButtonElement>(container, "#playGuestBtn");
    const playAIBtn = getElement<HTMLButtonElement>(container, "#playAIBtn");
    const tournamentBtn = getElement<HTMLButtonElement>(container, "#tournamentBtn");
    const matchHistoryBtn = getElement<HTMLButtonElement>(container, "#matchHistoryBtn");

    if (!playGuestBtn || !playAIBtn || !tournamentBtn || !matchHistoryBtn) {
        console.error("Boutons du menu introuvables");
        return;
    }

    matchHistoryBtn.addEventListener("click", () => {
        if (!username) return console.error("username is u ndefined");
        navigate(`/matchHistory/${encodeURIComponent(username)}`);
    });


    playGuestBtn.addEventListener("click", () => {
        openPongGuestModal(async (alias) => {
            players[1] = alias;
            renderPongGame(container, players, username);
        });
    });

    playAIBtn.addEventListener("click", () => {
        renderPongGame(container, players, username);
    });

    tournamentBtn.addEventListener("click", () => {
        openTournamentModal(username, async (playersFilled) => {
            renderPongGame(container, playersFilled, username);
        });
    });



}
