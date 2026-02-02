import { dico } from "../../../dico/larousse";
import { deleteAvatarBtn } from "../avatar/deleteAvatar";

export function outDeleteAvatarBtn(container: HTMLDivElement, avatar: string) {

    const deleteAvatarBtnEl = container.querySelector<HTMLDivElement>("#avatarDeleteBtnPlace");
    if (!deleteAvatarBtnEl) {
        console.error("missing content for delete avatar button place");
        return;
    }
    deleteAvatarBtnEl.innerHTML = ``;
    // console.log("avatar dans outDeleteAvatarBtn:", avatar);
    if (avatar !== "default-avatar.png") {
        deleteAvatarBtnEl.innerHTML = `<button id="deleteAvatarBtn" type="button" class="deactivateBtn mt-2">${dico.t("delete")}</button>`;
        const btn = deleteAvatarBtnEl.querySelector<HTMLButtonElement>("#deleteAvatarBtn");
        if (btn) {
            btn.addEventListener("click", () => {
                deleteAvatarBtn(container);
            });
        }
    }
}

export function outPen(btnId: string, tooltipName: string) {
    return `
    <div class="relative group flex items-center">
        <button id="${btnId}" class="seePublicProfile ">
            <img src="/assets/pen.png" class="ml-3 w-11 h-11" /></button>

        <!-- Tooltip -->
        <div class="absolute left-full ml-3 opacity-0 group-hover:opacity-100 
                pointer-events-none transition-opacity duration-200
                bg-pink-bg-title border-3 text-[24px] border-[#e28b7e] text-title-lang font-bold px-3 
                rounded-xl shadow-lg whitespace-nowrap z-50">
            ${dico.t(tooltipName)}
        </div>
    </div>`;
}

export function outBtn(isOAuth: boolean, description: string, notOauthDescription: string, idBtn: string, tooltipDescription: string, content?: string) {
    if (isOAuth) {
        if (description === "myPassword")
            return `<span class="cursor-default">${dico.t(notOauthDescription)}</span>`;
        else {
            return `<div class="flex justify-between w-full items-center">
            <div class="flex">
                    <span class="cursor-default font-bold min-w-fit">${dico.t(description)}&nbsp;</span>
                    ${content !== undefined ? `<span id="mailPlace" class="max-w-[340px] truncate" title="${content}">${content}</span>` : ``}
            </div>
        </div>`
        }

    }
    return `<div class="flex justify-between w-full items-center">
        <div class="flex">
                <span class="cursor-default font-bold min-w-fit">${dico.t(description)}&nbsp;</span>
                ${content !== undefined ? `<span id="mailPlace" class="max-w-[290px] truncate" title="${content}">${content}</span>`
            : `<span>∗∗∗∗∗∗∗∗∗∗∗∗</span>`
        }
        </div>
        ${outPen(idBtn, tooltipDescription)}
</div>`
}

export function outLangBtn() {
    return `<div class="flex w-full justify-between">
    <span class="cursor-default font-bold">${dico.t("myPreferedLanguage")}</span>
    <label class="cursor-pointer"><input type="radio" name="lang" class="mr-1" value="fr"></input>Français</label>
    <label class="cursor-pointer"><input type="radio" name="lang" class="mr-1" value="en"></input>English</label>
    <label class="cursor-pointer"><input type="radio" name="lang" class="mr-1" value="cn"></input>中文</label>
    </div>`;
}

