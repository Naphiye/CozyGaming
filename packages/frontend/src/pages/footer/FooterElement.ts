import { dico } from "../../dico/larousse.ts";
import { navigate } from "../../router.ts";

export function createFooter(footer: HTMLElement) {
    footer.innerHTML = `
    <div class=" relative flex justify-center min-h-[100px] h-full bg-brown-light text-sm text-title-lang">

        <div class="flex justify-between items-start w-[900px] p-4 gap-8 ">

            <!-- 💠 Infos site -->
            <span class="flex flex-col gap-1">
                <span>${dico.t("MadeWithHeart")}</span>
                <span>© ${new Date().getFullYear()} — ${dico.t("allRights")}</span>
                <a id="rgpdBtn" class="cursor-pointer underline hover:brightness-50">
                    ${dico.t("Policy")}
                </a>
            </span>

            <!-- 💠 Team section en ligne -->
            <div class="flex flex-col gap-2 items-center">

                <span class="text-xs font-semibold">${dico.t("MadeBy")}</span>

                <div class="flex gap-4">

                        <div class="flex items-center gap-2">
                            <img src="https://avatars.githubusercontent.com/u/151584301?v=4" class="w-10 h-10 rounded-full shadow" />
                                <a href="https://github.com/bibickette" target="_blank" class="underline hover:brightness-50 text-xs">Bibickette</a>
                        </div>

                        <div class="flex items-center gap-2">
                            <img src="https://avatars.githubusercontent.com/u/125670981?v=4" class="w-10 h-10 rounded-full shadow" />
                                <a href="https://github.com/Naphiye" target="_blank" class="underline hover:brightness-50 text-xs">Naphiye</a>
                        </div>
                        
                        <div class="flex items-center gap-2">
                        <img src="https://avatars.githubusercontent.com/u/152285663?v=4" class="w-10 h-10 rounded-full shadow" />
                        <a href="https://github.com/6Jeanne6" target="_blank" class="underline hover:brightness-50 text-xs">Taka</a>
                        </div>
                        
                        </div>
                </div>

            </div>

        </div>
    </div>
    `;

    const rgpdBtn = footer.querySelector<HTMLAnchorElement>('#rgpdBtn');
    if (!rgpdBtn) {
        console.error("rgpdBtn not found in footer");
        return;
    }
    rgpdBtn.addEventListener("click", async () => {
        navigate("/privacy-policy");
    });
}


