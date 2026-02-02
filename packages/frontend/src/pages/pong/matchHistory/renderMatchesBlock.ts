import { emptyMessage } from "./utils";
import { formatDate } from "./utils.ts";
import { dico } from "../../../dico/larousse.ts";
import { Match } from "../gameObjects/match.ts";

/** Rendu d’un match classique ou AI */
function renderMatchItem(m: Match) {
   const isWin = m.scoreLeft > m.scoreRight;
   const scoreColor = isWin ? "text-[#2E7D32]" : "text-[#C62828]";

   return `
      <div class="matchBloc">
         <div class="matchDate">${formatDate(m.date)}</div>
         <div class="matchPlayers">
            <span class="matchUser text-left pr-3" title="${m.playerLeft}">${m.playerLeft}</span>
            <span class="matchVS">${dico.tRaw("VS")}</span>
            <span class="matchGuest text-right pl-6.5 pr-1" title="${m.playerRight}">${m.playerRight}</span>
         </div>
         <div class="matchScore ${scoreColor}">${m.scoreLeft} - ${m.scoreRight}</div>
      </div>
   `;
}


/** Rendu des blocs classiques ou AI */
export function renderMatchesBlock(container: HTMLDivElement, blockId: string, matches: Match[]) {
   const block = container.querySelector<HTMLDivElement>(`#${blockId} .matchList`);
   if (!block) return;

   if (!matches.length) {
      block.innerHTML = emptyMessage("NoMatches");
      return;
   }

   block.innerHTML = matches
      .map(m => renderMatchItem(m))
      .join("");
}

