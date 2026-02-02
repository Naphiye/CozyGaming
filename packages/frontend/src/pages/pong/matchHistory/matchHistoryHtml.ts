import { dico } from "../../../dico/larousse.ts";
import { seePublicProfileEye } from "../../DOM_helper.ts";

export function getmatchHistoryHtml(username: string): string {
  return `
    <div class="containerAllInCenter animateFade">
      <div class="relative p-[70px] w-[1150px] my-[100px] ">
        <div class="absolute inset-0 bg-[rgba(255,246,239,0.9)] blur-lg rounded-[90px] -z-10 "></div>
        
        <div class="flex flex-nowrap place-content-center items-center gap-x-[50px] mb-[60px]">
          <h1 class="titlePage flex flex-col pr-[35px] pl-[35px] p-[15px]">
            ${dico.tRaw("MatchHistory")}
          </h1>
                <div id="navbar"></div>
        </div>
            <div class="bgUsers py-[30px] px-4 flex flex-col items-center max-w-full">
                <span class="flex items-center titleFriends px-5  mb-7 text-[45px]">${username}
                    ${seePublicProfileEye()}
                </span>

        <!-- ✅ Grille fixe à 3 colonnes -->
        <div class="grid grid-cols-[repeat(3,310px)] gap-x-5 ">
          <!-- Classic -->
          <div id="classic-block" class="matchGrid">
            <h2 class="titleFriends px-2 text-[35px] mb-4">${dico.tRaw("Classic")}</h2>
            <div class="matchList scrollbar cursor-default"></div>
          </div>

          <!-- AI -->
          <div id="ai-block" class="matchGrid">
            <h2 class="titleFriends px-2 text-[35px] mb-4 ">${dico.tRaw("AI")}</h2>
            <div class="matchList scrollbar cursor-default"></div>
          </div>

          <!-- Tournament -->
          <div id="tournament-block" class="matchGrid">
            <h2 class="titleFriends px-2 text-[35px] mb-4">${dico.tRaw("Tournament")}</h2>
            <div class="matchList scrollbar cursor-default"></div>
          </div>
        </div>
            </div>

      </div>
    </div>
  `;
}

