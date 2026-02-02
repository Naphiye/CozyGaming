import { auth } from "../../../authentication/auth";
import { dico } from "../../../dico/larousse";
import { navigate } from "../../../router";
import { confirmFormTwoBtn } from "../../DOM_helper";
import type { trad } from "../../friends/utils/btnHandler/formConfirm";
import { EmptyModal } from "../../modal/EmptyModal";

type navbarTypeBtn = {
    idBtn: string,
    img: string,
    title: string,
    classImg: string
    classBtn: string
}

function navbarElement(el: navbarTypeBtn) {
    return `<div class="relative group flex items-center">
    <button id="${el.idBtn}" class="${el.classBtn}" >
        <img src="${el.img}" alt="" class="${el.classImg}" />
    </button>

    <!-- Tooltip -->
    <div class="absolute left-full ml-3 opacity-0 group-hover:opacity-100 
                pointer-events-none transition-opacity duration-200
                bg-brown-dark border-3 border-[#814f40] text-white font-bold px-3 
                rounded-xl shadow-lg whitespace-nowrap z-50">
        ${el.title}
    </div>
</div>`;
}


function navbarThreeElements(el1: navbarTypeBtn, el2: navbarTypeBtn, el3: navbarTypeBtn) {
    return ` <div class="flex gap-x-4">
        ${navbarElement(el1)}
        ${navbarElement(el2)}
        ${navbarElement(el3)}
    </div>`;
}

export function outputNavbar() {
    const logout: navbarTypeBtn = {
        idBtn: "logoutBtn",
        img: "/assets/logout.png",
        title: dico.t("titleLogoutNavbar"),
        classImg: "navbarImg ",
        classBtn: "navbarBtn p-1.5"
    };
    const home: navbarTypeBtn = {
        idBtn: "homeBtn",
        img: "/assets/home.png",
        title: dico.t("titleHomeNavbar"),
        classImg: "navbarImg",
        classBtn: "navbarBtn p-1.5"

    };
    const returnEl: navbarTypeBtn = {
        idBtn: "returnBtn",
        img: "/assets/return.png",
        title: dico.t("titleReturnNavbar"),
        classImg: "navbarImg2",
        classBtn: "navbarBtn p-2"

    };
    const friends: navbarTypeBtn = {
        idBtn: "friendsBtn",
        img: "/assets/friends.png",
        title: dico.t("titleFriendsNavbar"),
        classImg: "navbarImg2",
        classBtn: "navbarBtn p-2"

    };
    const profile: navbarTypeBtn = {
        idBtn: "profileBtn",
        img: "/assets/profile.png",
        title: dico.t("titleProfileNavbar"),
        classImg: "navbarImg",
        classBtn: "navbarBtn p-1.5"

    };
    const pong: navbarTypeBtn = {
        idBtn: "pongBtn",
        img: "/assets/game.png",
        title: dico.t("titlePongNavbar"),
        classImg: "navbarImg",
        classBtn: "navbarBtn p-1.5"
    };

    return `<div class="flex flex-col gap-y-3 ">
        ${navbarThreeElements(home, profile, logout)}
        ${navbarThreeElements(pong, friends, returnEl)}
    </div>`;
}

export function navbar(container: HTMLDivElement, deactivateBtn?: string) {
    const navbar = container.querySelector<HTMLDivElement>("#navbar");
    if (!navbar) {
        console.error("missing content for navbar");
        return;
    }
    navbar.innerHTML = outputNavbar();

    const logout = navbar.querySelector<HTMLButtonElement>("#logoutBtn");
    const home = navbar.querySelector<HTMLButtonElement>("#homeBtn");
    const friends = navbar.querySelector<HTMLButtonElement>("#friendsBtn");
    const returnBtn = navbar.querySelector<HTMLButtonElement>("#returnBtn");
    const pong = navbar.querySelector<HTMLButtonElement>("#pongBtn");
    const profile = navbar.querySelector<HTMLButtonElement>("#profileBtn");
    if (!logout || !home || !friends || !returnBtn || !pong || !profile) {
        console.error("missing content for navbar");
        return;
    }
    logout.addEventListener("click", async () => {
        confirmLogout();

    });
    returnBtn.addEventListener("click", async () => {
        history.back();
    });
    // Utility function
    const activate = (id: string, fn: () => void) => {
        if (deactivateBtn === id) return;   // désactive ce bouton
        const el = navbar.querySelector<HTMLButtonElement>(`#${id}`);
        el?.addEventListener("click", fn);
    };
    activate("friendsBtn", async () => {
        navigate("/friends");
    });
    activate("pongBtn", async () => {
        navigate("/pong");
    });
    activate("profileBtn", async () => {
        navigate("/profile/me");
    });
    activate("homeBtn", async () => {
        navigate("/");
    });
}

async function confirmLogout() {
    const form = document.createElement('div');

    const trad: trad = {
        titleForm: "titleLogoutNavbar",
        contentForm: "logOutConfirmForm",
        actionBtn: "titleLogoutNavbar",
        noActionBtn: "StayLoggedIn"
    }
    form.innerHTML = confirmFormTwoBtn(trad);

    const modal = EmptyModal({
        title: dico.t(trad.titleForm),
        children: form
    });

    const actionBtn = modal.querySelector<HTMLButtonElement>("#actionBtn");
    const noActionBtn = modal.querySelector<HTMLButtonElement>("#noActionBtn");

    if (!actionBtn || !noActionBtn) {
        console.error("missing content for navbar logout");
        return;
    }
    actionBtn.addEventListener("click", async () => {
        modal.close();
        await auth.logout();
    });

    noActionBtn.addEventListener("click", async () => {
        modal.close();
    });
}


