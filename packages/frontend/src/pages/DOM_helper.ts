import { dico } from "../dico/larousse.ts";
import { navigate } from "../router.ts";
import type { trad } from "./friends/utils/btnHandler/formConfirm.ts";
import { EmptyModal } from "./modal/EmptyModal.ts";

// import { refreshIfNeeded } from "../access_token.ts";

/*
Bienvenue sur le DOM helper

ici ca sert a creer des fonctions quon pourra reutiliser dans plusieurs page pour eviter de setup les meme boutons 50 fois
- donc en gros on indique cest quel queryselector
- on verifie si le bouton existe
- ensuite on lui indique son event

il y a plusieurs types je vous invite a regarder ceux deja existant et copier coller pour vos besoins

ici cest pour le DOM un peu universel pour le site (langues, le footer de la page...)
cest JUSTE pour pouvoir indiquer une action, le CSS nest pas compris ! donc reutilisable sous plusieurs apparences differentes

ensuite il faut juste appeler la fonction, exemple : logoutBtn(); en dessous de la page

evidemment il faut import les fonctions dans les pages voulues

rappel : les query selector cest les id
exemple:
        <button id="logoutBtn" class="btn">Se déconnecter</button>

et pour get l'id faut mettre un # devant

*/

///////////////////////////////
/* BOUTON REVENIR A LACCUEIL */
export function homeReturnBtn(container: HTMLElement) {
    const btn = container.querySelector("#homeReturn");
    if (!btn) return console.error("#homeReturn is missing");
    btn.addEventListener("click", async () => {
        navigate("/");
    });
}

export function setPlaceHolderRequiredMsg(element: HTMLInputElement, msg: string) {
    element.addEventListener("invalid", () => {
        element.setCustomValidity(dico.tRaw(msg));
    });
    element.addEventListener("input", () => {
        element.setCustomValidity("");
    });
}

export function loadPage(container: HTMLElement) {
    container.innerHTML = `
    <div class="containerAllInCenter ">
        <div class="relative p-[70px] pb-20 pt-20 min-w-fit">
            <div class="absolute inset-0 bg-[rgba(255,246,239,0.9)] blur-lg rounded-[90px] -z-10"></div>
            <div class="text-center font-bold text-[35px] pl-[50px] pr-[50px] text-title-lang">
                ${dico.t("loading")}
            </div>
        </div>
    </div>
    `;
};

export function confirmFormTwoBtn(trad: trad, content?: string) {
    return `
        <div class="cursor-default text-center leading-7 mx-5">
            ${dico.t(trad.contentForm)}
        </div>
        ${content !== undefined ? `<div class="text-center">${content}</div>` : ``}
        <div class="lineForm mt-4"></div>
        <div class="flex justify-between pt-[18px]">
           <button id="actionBtn" class="formRedBtn">
           ${dico.t(trad.actionBtn)}</button>
           <button id="noActionBtn" class="formBtn">
           ${dico.t(trad.noActionBtn)}</button>
        </div>`;
};

export function confirmModalOneBtn(title: string, content: string, isSuccess?: boolean | false) {
    const form = document.createElement("div");
    form.innerHTML = `
        <div class="cursor-default gap-y-1.5 text-center leading-7 mx-5 ${isSuccess ? `text-green-500` : `text-red-500`}">
            ${content}
        </div>
        <div class="lineForm mt-4"></div>
        <div class="flex justify-center pt-[18px]">
            <button id="ok" class="formBtn">
            ${dico.t("confirmationBtn")}</button>
        </div>
    `;
    const modal = EmptyModal({
        title: title,
        children: form,
    });

    const confirmationBtn = form.querySelector<HTMLButtonElement>("#ok");
    if (!confirmationBtn) {
        console.error("missing content in errormessagemodal");
        return;
    }
    confirmationBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        modal.close();
    });
}

export function seePublicProfileEye() {
    return `
    <div class="relative group flex items-center">
        <button id="seePublicProfileBtn" class="seePublicProfile">
            <img src="/assets/eye.png" class="ml-4 w-11 h-11" alt="avatar" />
        </button>

        <!-- Tooltip -->
        <div class="absolute left-full ml-3 opacity-0 group-hover:opacity-100 
                pointer-events-none transition-opacity duration-200
                bg-pink-bg-title border-3 text-[24px] border-[#e28b7e] text-title-lang font-bold px-3 
                rounded-xl shadow-lg whitespace-nowrap z-50">
            ${dico.t("seePublicProfile")}
        </div>
    </div>`;
}