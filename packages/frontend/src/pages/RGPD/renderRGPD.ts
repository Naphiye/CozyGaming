import { dico } from "../../dico/larousse.ts";
import { loadPage } from "../DOM_helper.ts";
import { homeReturnBtn } from "../DOM_helper.ts";




export async function renderRGPD(container: HTMLDivElement) {
    const footer = document.querySelector<HTMLDivElement>("footer");
    if (!footer) {
        console.error("Footer not found in DashboardPage");
        return;
    }
    footer.style.display = "none";
    loadPage(container);

    container.innerHTML = ` <div class="containerAllInCenter animateFade">
            <div class="relative p-[70px] pb-[100px] pt-20 w-[1150px] my-[100px] mt-[100px] ">
                <div class="absolute inset-0 bg-[rgba(255,246,239,0.9)] blur-lg rounded-[90px] -z-10"></div>
    
                <div class="flex flex-nowrap place-content-center items-center gap-x-[50px] mb-[50px]">
                <h1 class="titlePage pr-[35px] pl-[35px] p-[15px] min-w-fit">${dico.t("rgpdTitle")}</h1>
                </div>
                <div class="flex justify-center gap-x-10 items-center mb-10">
                  <button id="homeReturn" class="smallLogBtn w-fit">${dico.t("homeReturn")}</button>
                  <button id="returnBtn" class="smallLogBtn w-fit">${dico.t("ReturnPage")}</button>
                </div>
    
                <div class=" flex justify-center">
                    <div class="bgUsers p-[30px] pr-10 pl-10 flex flex-col items-center max-w-fit">
                    <div class="RGPDintro">
                    <p>${dico.t("rgpdIntro")}</p>
                    </div>
                        <div class="RGPDcontent">

                          <h2 class=">${dico.t("rgpdSection1Title")}</h2>
                          <div>${dico.t("rgpdSection1Text")}</div>

                          <h2 class="mt-12">${dico.t("rgpdSection2Title")}</h2>
                          <div>${dico.t("rgpdSection2Text")}</div>

                          <h2 class="mt-12">${dico.t("rgpdSection3Title")}</h2>
                          <div>${dico.t("rgpdSection3Text")}</div>

                          <h2 class="mt-12">${dico.t("rgpdSection4Title")}</h2>
                          <div>${dico.t("rgpdSection4Text")}</div>

                          <h2 class="mt-12">${dico.t("rgpdSection5Title")}</h2>
                          <div>${dico.t("rgpdSection5Text")}</div>

                          <h2 class="mt-12">${dico.t("rgpdSection6Title")}</h2>
                          <div>${dico.t("rgpdSection6Text")}</div>

                          <h2 class="mt-12">${dico.t("rgpdSection7Title")}</h2>
                          <div>${dico.t("rgpdSection7Text")}</div>

                          <h2 class="mt-12">${dico.t("rgpdSection8Title")}</h2>
                          <div>${dico.t("rgpdSection8Text")}</div>

                          <h2 class="mt-12">${dico.t("rgpdSection9Title")}</h2>
                          <div>${dico.t("rgpdSection9Text")}</div>

                        </div>
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


