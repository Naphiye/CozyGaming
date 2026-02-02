import { getmatchHistoryHtml } from "./matchHistoryHtml.ts";
import { fetchMatchHistoryByUsername } from "./fetchHistory.ts";
import { dico } from "../../../dico/larousse.ts";
import { loadPage } from "../../DOM_helper.ts";
import { groupMatchesByMode } from "./utils.ts";
import { renderMatchesBlock } from "./renderMatchesBlock.ts";
import { renderTournamentBlock } from "./renderTournamentBlock.ts";
import { navigate } from "../../../router.ts";
import { navbar } from "../../utils/navbar/navbar.ts";
import { ErrorPage } from "../../utils/404.ts";


export async function renderMatchHistory(container: HTMLDivElement, params: { username: string }) {
   const footer = document.querySelector<HTMLDivElement>("footer");
   if (!footer) {
      console.error("Footer not found in DashboardPage");
      return;
   }
   footer.style.display = "none";
   loadPage(container);


   try {
      const data = await fetchMatchHistoryByUsername(params.username);

      const matches = data.matches || [];

      container.innerHTML = getmatchHistoryHtml(params.username);
      dico.setLanguage(dico.getLanguage());

      navbar(container);

      const ProfileBtn = container.querySelector<HTMLButtonElement>("#seePublicProfileBtn");
      if (ProfileBtn) ProfileBtn.addEventListener("click", () => {
         navigate(`/profile/${encodeURIComponent(params.username)}`);
      });

      // Regroupement des matchs par mode
      const groupedMatches = groupMatchesByMode(matches);

      // Rendu des trois sections
      renderMatchesBlock(container, "classic-block", groupedMatches.classic);
      renderMatchesBlock(container, "ai-block", groupedMatches.ai);
      renderTournamentBlock(container, "tournament-block", groupedMatches.tournament);
      footer.style.display = "block";

   } catch (err: any) {
      console.error(err);
      ErrorPage(container);
      return;
      //   container.innerHTML = `
      //      <div class="error">
      //         <p>${dico.tRaw("errorLoadingHistory") || "Error loading match history."}</p>
      //         <p class="details">${err.message}</p>
      //      </div>
      //   `;
   }
}

