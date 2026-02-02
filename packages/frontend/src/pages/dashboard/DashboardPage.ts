import { dico } from "../../dico/larousse.ts";
import { navigate } from "../../router.ts";
import { loadPage } from "../DOM_helper.ts";
import { navbar } from "../utils/navbar/navbar.ts";

export async function DashboardPage(container: HTMLDivElement) {
    const footer = document.querySelector<HTMLDivElement>("footer");
    if (!footer) {
        console.error("Footer not found in DashboardPage");
        return;
    }
    footer.style.display = "none";
    loadPage(container);

    container.innerHTML = `
<div class="containerAllInCenter animateFade">
    <div class="relative p-[70px] w-[1150px] my-[100px] mt-[100px] ">
        <div class="absolute inset-0 bg-[rgba(255,246,239,0.9)] blur-lg rounded-[90px] -z-10"></div>

        <div class="flex flex-nowrap place-content-center items-center gap-x-[50px] mb-[60px] ">
            <h1 class="titlePage pr-[35px] pl-[35px] p-[15px]">${dico.t("WelcomeLoggedIn")}</h1>
            <div id="navbar"></div>
        </div>
        <div class="bg-[rgb(209,157,159)] shadow-[0_4px_20px_rgba(250,210,203,0.9)] rounded-[26px] py-10 px-10 flex flex-col items-center max-w-fit">
            <span class="titleFriends px-5 mb-10 text-[45px]">${dico.t("WhatWeDoToday")}</span>

            <div class="flex flex-nowrap justify-around gap-x-[50px]">
    
                <button id="myProfileBtn" class="dashboardBtn">
                    <img src="assets/capy/king_right.png" alt="" class="w-34" />
                    ${dico.t("MyProfile")}
                </button>
    
                <button id="playPongBtn" class="dashboardBtn">
                    <img src="assets/capy/pc.png" alt="" class="w-34" />
                    ${dico.t("pongMenu")}
                </button>
                <button id="friendsBtn" class="dashboardBtn">
                    <img src="assets/capy/simlish.png" alt="" class="w-34" />
                    ${dico.t("MyFriends")}
                </button>
            </div>
        </div>
    </div>

    </div>
`;
    // <button id="testBtn" class="classicBtn">TEST REFRESH TOKEN</button>
    footer.style.display = "block";
    const playPongBtn = container.querySelector<HTMLButtonElement>("#playPongBtn");
    const myProfileBtn = container.querySelector<HTMLButtonElement>("#myProfileBtn");
    const friendsBtn = container.querySelector<HTMLButtonElement>("#friendsBtn");

    // const testBtn = container.querySelector<HTMLButtonElement>("#testBtn");
    if (!playPongBtn || !myProfileBtn || !friendsBtn) {
        console.error("missing content in dashboard");
        return;
    }

    playPongBtn.addEventListener("click", async () => {
        navigate("/pong");
    });

    myProfileBtn.addEventListener("click", async () => {
        navigate("/profile/me");
    });

    friendsBtn.addEventListener("click", async () => {
        navigate("/friends");
    });



    // test du refresh token
    // if(testBtn){
    //     testBtn.addEventListener("click", async () => {
    //         const ok = await refreshIfNeeded();
    //         if (!ok) {
    //             alert("Vous devez être connecté !");
    //             return;
    //         }
    //     });
    // }

    ////////// LE SET DE 6 ITEMS DE NAVIGATION
    navbar(container, "homeBtn");
}
