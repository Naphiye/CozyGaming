import { dico } from "../../dico/larousse.ts";
import { homeReturnBtn } from "../DOM_helper.ts";

export function ErrorPage(container: HTMLDivElement) {
  container.innerHTML = `  <div class="containerAllInCenter animateFade">
  <div class="relative p-[70px] pb-20 pt-20 w-[900px]">
    <div class="absolute inset-0 bg-[rgba(255,246,239,0.9)] blur-lg rounded-[90px] -z-10"></div>
      <div class="flex flex-col items-center pl-[50px] pr-[50px] ">
        <p class="text-center font-bold text-[45px] text-title-lang">${dico.t("Error404Title")}</p>
        <p class="text-center font-bold text-[35px] text-title-lang mt-5">${dico.t("Err404")}</p>
        <img src="/assets/dino.gif" class="mt-10" alt="dino empty internet ouin">
        <div class="flex gap-x-10 items-center px-[50px] mt-10">
          <button id="homeReturn" class="smallLogBtn w-fit">${dico.t("homeReturn")}</button>
          <button id="returnBtn" class="smallLogBtn w-fit">${dico.t("ReturnPage")}</button>
        </div>
    </div>
  </div>
</div>`;

  homeReturnBtn(container);
  const returnBtn = container.querySelector<HTMLButtonElement>("#returnBtn");
  if (!returnBtn) {
    console.error("missing content in error404");
    return;
  }
  returnBtn.addEventListener("click", async () => {
    history.back();
  });
}
