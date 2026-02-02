import { dico } from "../../../dico/larousse";
function getPongStatsHtml(): string {
  return `
  <div id="pongStats" class="statsBloc">
    <h2 class="statsTitle">
      ${dico.tRaw("pongStatsTitle")}
    </h2>

    <div class="grid grid-cols-2 gap-4 w-full">
      
      <div class="flex flex-col gap-2">
        <div class="statsLine">
          <span>${dico.tRaw("matchesPlayed")}:</span>
          <span id="statMatchesPlayed" class="statsValue">0</span>
        </div>

        <div class="statsLine">
          <span>${dico.tRaw("tournamentsOrganized")}:</span>
          <span id="statTournamentsOrganized" class="statsValue">0</span>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="statsLine">
          <span>${dico.tRaw("matchesWon")}:</span>
          <span id="statMatchesWon" class="statsValue text-[rgb(19,112,40)]">0</span>
        </div>

        <div class="statsLine">
          <span>${dico.tRaw("matchesLost")}:</span>
          <span id="statMatchesLost" class="statsValue text-[rgb(190,45,19)]">0</span>
        </div>
      </div>

    </div>
  </div>
  `;
}


function setStats(
    container: HTMLElement,
    stats: { matchesPlayed: number; matchesWon: number; matchesLost: number; tournamentsOrganized: number } | null = null 
) {
    const playedEl = container.querySelector<HTMLSpanElement>("#statMatchesPlayed");
    const wonEl = container.querySelector<HTMLSpanElement>("#statMatchesWon");
    const lostEl = container.querySelector<HTMLSpanElement>("#statMatchesLost");
    const tournamentsEl = container.querySelector<HTMLSpanElement>("#statTournamentsOrganized");

  


    if (playedEl && wonEl && lostEl && tournamentsEl) {

      if (!stats) {
        playedEl.textContent = "Not available";
        wonEl.textContent = "Not available";
        lostEl.textContent = "Not available";
        tournamentsEl.textContent = "Not available";
        return;
      }
        playedEl.textContent = String(stats.matchesPlayed);
        wonEl.textContent = String(stats.matchesWon);
        lostEl.textContent = String(stats.matchesLost);
        tournamentsEl.textContent = String(stats.tournamentsOrganized);
    } else {
        console.error("⚠️ Missing one or more stat elements in DOM");
    }
}


export function renderPongStats(container: HTMLElement, stats: { matchesPlayed: number; matchesWon: number; matchesLost: number; tournamentsOrganized: number } | null = null ) {

    const pongStatEl = container.querySelector("#pongStat");
    if (pongStatEl)
        pongStatEl.innerHTML = getPongStatsHtml();

    setStats(container, stats);

}

