import { emptyMessage } from "./utils";
import { formatDate } from "./utils";
import { dico } from "../../../dico/larousse";
import { Match } from "../gameObjects/match";

// on tulise userplace et pas username pour savoir si le user etait a gauche ou a droite car le username peut changer.
function choosePlayerClass(userplace: string, side: "left" | "right"): string {
  if (userplace === "none") return "matchGuest";
  return userplace === side ? "matchUser" : "matchGuest";
}

function chooseScoreColor(userplace: string, scoreLeft: number, scoreRight: number): string {
  if (userplace === "none") return "text-[#915d4d]"; // neutre

  const userWon =
    (userplace === "left" && scoreLeft > scoreRight) ||
    (userplace === "right" && scoreRight > scoreLeft);

  return userWon ? "text-[#2E7D32]" : "text-[#C62828]";
}

/** Rendu d’un match de tournoi */
function renderTournamentMatch(m: Match, index: number, stageLabels: string[]) {
  const scoreColor = chooseScoreColor(m.userplace, m.scoreLeft, m.scoreRight);
  const leftClass = choosePlayerClass(m.userplace, "left");
  const rightClass = choosePlayerClass(m.userplace, "right");

  return `
    <div class="stage text-brown-light text-[16px] font-semibold">${stageLabels[index]}</div>
    <div class="matchPlayers">
      <span class="${leftClass} text-left pr-3" title="${m.playerLeft}">${m.playerLeft}</span>
      <span class="matchVS">${dico.tRaw("VS")}</span>
      <span class="${rightClass} text-right pl-6.5 pr-1" title="${m.playerRight}">${m.playerRight}</span>
    </div>
    <div class="matchScore ${scoreColor}">${m.scoreLeft} - ${m.scoreRight}</div>
    ${index < 2 ? `<div class="w-full border-t border-[#CFAFA3]"></div>` : ""}
  `;
}



/** Rendu d’un bloc tournoi */
export function renderTournamentBlock(container: HTMLDivElement, blockId: string, matches: Match[]) {
  const block = container.querySelector<HTMLDivElement>(`#${blockId} .matchList`);
  if (!block) return;

  if (!matches.length) {
    block.innerHTML = emptyMessage("NoMatches");
    return;
  }

  const stageLabels = [
    dico.tRaw("FirstMatch"),
    dico.tRaw("SecondMatch"),
    dico.tRaw("Final")
  ];

  let html = "";

  // 🔹 On parcourt les matchs 3 par 3, chaque paquet = un tournoi
  for (let i = 0; i < matches.length; i += 3) {
    const group = matches.slice(i, i + 3); // prend 3 matchs
    const date = group[0].date;           // tous les matchs ont la même date

    html += `
      <div class="matchBloc ">
        <div class="matchDate">${formatDate(date)}</div>
        ${group.map((m, idx) => renderTournamentMatch(m, idx, stageLabels)).join("")}
      </div>
    `;
  }

  block.innerHTML = html;
}
