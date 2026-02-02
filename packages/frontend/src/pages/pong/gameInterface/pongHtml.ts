import { dico } from "../../../dico/larousse.ts";

export function getPongMenuHtml(): string {
    return `
    <div class="containerAllInCenter animateFade">
        <div class="relative p-[70px] w-[1150px] my-[100px] mt-[100px] ">
            <div class="absolute inset-0 bg-[rgba(255,246,239,0.9)] blur-lg rounded-[90px] -z-10"></div>

            <div class="flex flex-nowrap place-content-center items-center gap-x-[50px] mb-[60px]">
                <h1 class="titlePage pr-[35px] pl-[35px] p-[15px]">${dico.t("pongMenu")}</h1>
                <div id="navbar"></div>
            </div>

            <div class="flex items-center gap-x-[35px] ">
                <div id="pongStat"></div>
                <div class="grid items-center justify-center ">
                    <button id="matchHistoryBtn" class="matchHistoryBtn ">
                        <img src="/assets/matchhistory.png" alt="matchhistory" class="w-34 pr-2" />
                        ${dico.t("MatchHistory")}
                    </button>
                </div>
            </div>

            <div class="flex justify-between mt-10">
                <button class="pongBtn max-w-[310px]" id="playGuestBtn">
                    <img src="/assets/twoplayers.png" alt="matchhistory" class="w-30" />
                    ${dico.t("playGuest")}</button>
                <button class="pongBtn max-w-[310px]" id="playAIBtn">
                    <img src="/assets/robot-brown.png" alt="matchhistory" class="w-30" />
                    ${dico.t("playAI")}</button>
                <button class="pongBtn max-w-[310px]" id="tournamentBtn">
                    <img src="/assets/fourplayers.png" alt="matchhistory" class="w-30" />
                    ${dico.t("createTournament")}</button>
            </div>

        </div>
    </div>
    `;

}

export function getPongGameHtml(): string {
    return `
    <div class="containerAllInCenter animateFade">
      <div class="relative p-[70px] w-[1150px] my-[100px] mt-[100px] ">
      <div class="absolute inset-0 bg-[rgba(255,246,239,0.9)] blur-lg rounded-[90px] -z-10"></div>
      
      <div class="flex flex-nowrap place-content-center items-center gap-x-[50px] mb-[60px]">
      <h1 class="titlePage pr-[35px] pl-[35px] p-[15px]">
            ${dico.t("PONG")}
          </h1>
          
          <button id="menuReturn" class="smallLogBtn items-center group">
          ${dico.t("pongMenu")}
          <img src="/assets/game.png" class="group-hover:brightness-160 w-11 h-11 ml-2 transition duration-250 ease-in-out" />
          </button>
        </div>

        <!-- Wrapper pour le canvas avec fond flou -->
        <div class="relative p-10 rounded-[90px] mt-[50px]">
          <div class="absolute inset-0 bg-[rgba(250,210,203,0.9)] blur-lg rounded-[90px] -z-10 pointer-events-none"></div>
          <canvas id="pong-canvas"></canvas>
        </div>

      </div>
    </div>
  `;
}





