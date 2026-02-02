import { dico } from "../../dico/larousse";
import { navigate } from "../../router";
import { navbar } from "../utils/navbar/navbar";
import { loadPage } from "../DOM_helper";
import { updateAllSections } from "./utils/sections";
import { ws_friendsPage } from "./utils/ws_friendsPage";
import { auth } from "../../authentication/auth";
import { safeFetch } from "../pong/gameInterface/fetchGame";

// fetch all users sauf mwa
async function fetchAllUsers() {
    const lang = dico.getLanguage();
    const res = await fetch("/api/users", {
        credentials: "include",
        headers: {
            "Accept-Language": lang,
        },
    });
    const data = await res.json();
    if (!res.ok) {
        if (res.status === 498) {
            auth.setUser(false, false);
            // navigate("/");
        }
        if(res.status === 429){
            console.log("Too many requests");
        }
        throw new Error(data.error || dico.tRaw("unknownError"));
    }
    // donc la en gros jai une array[] de users
    return data;
}

//////////////////////////////////////////////////////////////////////////////
////// on peut cliquer sur les pseudo pour se rediriger vers leurs public profile
export function usernameAreLinkToPublicProfile(usersEl: HTMLDivElement) {
    // click sur le pseudo
    const allUsernameLink = usersEl.querySelectorAll<HTMLSpanElement>("#usernameLink");
    allUsernameLink.forEach((username) => {
        username.addEventListener("click", () => {
            const userWanted = username.dataset.username;
            if (!userWanted) {
                console.error("missing username");
                return;
            }
            navigate(`/profile/${encodeURIComponent(userWanted)}`);
        });
    });
}
//////////////////////////////////////////////////////////////////////////////
////// mes users individuel les hasAdd Accept etc cest juste les boutons de remove/block/add
// envoie le bon status visuellement
export function onlineStatusDot(isOnline: boolean) {
    const status =
        isOnline ? `<span class="statusOnline"></span>
                <span class="statusOnlineAnimate" title="${dico.tRaw("onlineStatus")}"></span>`
            : `<span class="absolute statusOffline" title="${dico.tRaw("offlineStatus")}"></span>`;

    return `   
        ${status} 
`;
}
/// loading="lazy" = (ne charger que celles visibles à l’écran)
/// le src en fait cest lapi vers limage ca fait genre /api/users/avatar/:username
/// et le navigateur fait le fetch lui meme
// // ${hasAdd || hasAccept || hasBlock ? ca veut dire on est pas sur le bloc blockedfriends donc on peut voir le status}
export function userCardHtml(user: usersType, hasAdd: boolean, hasAccept: boolean, hasRemove: boolean, hasBlock: boolean, isblockedSection?: boolean | false) {
    return `<div class="bgUniqueUser cursor-default hover:scale-110 hover:transition hover:duration-250 hover:ease-in-out"> 
        <div class="relative">
            ${hasAdd || hasAccept || hasBlock ? `<div id="onlineStatus${user.id}" class="bgStatus">${onlineStatusDot(false)}</div>` : ``}
            <img src="/api/uploads/${user.avatar}?v=${Date.now()}" class="avatarFriendsList" loading="lazy" />
        </div>
        <span ${hasAdd || hasAccept || hasBlock ? `id="usernameLink" class="usernameFriend"` :
            `class="usernameBlock"`} title="${user.username}" data-username="${user.username}">${user.username}</span>
        <div class= "flex items-center gap-x-1">
            ${hasAdd || (hasAccept && !user.sendByAuthor) ? `<button id="addFriendBtn" data-userid="${user.id}" title="${dico.tRaw("titleAddUser")}">
                <img src="/assets/add.png" class="logoBtnFriends" alt="addBtn"/></button>`
            : ``}
            ${hasRemove ? `<button id="removeFriendBtn" data-userid="${user.id}" title="${isblockedSection ? `${dico.tRaw("unBlock")}` : `${dico.tRaw("delete")}`}">
                <img src="/assets/remove.png" class="logoBtnFriends brightness-125" alt="removeBtn"/></button>`
            : ``}
            ${hasBlock ? `<button id="blockedFriendBtn" data-userid="${user.id}" title="${dico.tRaw("block")}">
                <img src="/assets/block.png" class="logoBtn2Friends" alt="blockBtn"/></button>`
            : ``}
        </div>
    </div>`;
}


// le type de mon user dans mes return de fetch
export type usersType = { id: number, username: string, avatar: string, sendByAuthor: boolean };
export type blocType = { el: HTMLDivElement, data: usersType[] };

export async function FriendsPage(container: HTMLDivElement) {
    const footer = document.querySelector<HTMLDivElement>("footer");
    if (!footer) {
        console.error("Footer not found in DashboardPage");
        return;
    }
    footer.style.display = "none";
    loadPage(container);


    const data = await safeFetch(() => fetchAllUsers(), "/", "Error with fetchAllUsers");
    if (!data) return;
    container.innerHTML = `
    <div class="containerAllInCenter animateFade">
        <div class="relative p-[70px] w-[1150px] my-[100px] mt-[100px] ">
            <div class="absolute inset-0 bg-[rgba(255,246,239,0.9)] blur-lg rounded-[90px] -z-10"></div>

            <div class="flex flex-nowrap place-content-center items-center gap-x-[50px] mb-[60px]">
                <h1 class="titlePage pr-[35px] pl-[35px] p-[15px]">${dico.t("MyFriends")}</h1>
                <div id="navbar"></div>
            </div>
            
            <div class="grid grid-cols-[repeat(2,470px)] place-content-center gap-10">
                <div class="bgUsers bgUsersPaddingFriend">
                    <h2 class="titleFriends px-5  mb-[15px] text-[35px]">${dico.t("FriendsToAdd")}</h2>
                    <div id="allUsers" class="usersBloc scrollbar"></div>
                </div>
                <div class="bgUsers bgUsersPaddingFriend">
                    <h2 class="titleFriends px-5 mb-[15px] text-[35px]">${dico.t("PendingFriends")}</h2>
                    <div id="pendingFriends" class="usersBloc scrollbar"></div>
                </div>
                <div class="bgUsers bgUsersPaddingFriend">
                    <h2 class="titleFriends px-5 mb-[15px] text-[35px]">${dico.t("MyFriends")}</h2>
                    <div id="myFriends" class="usersBloc scrollbar"></div>
                </div>
                <div class="bgUsers bgUsersPaddingFriend ">
                    <h2 class="titleFriends px-5 mb-[15px] text-[35px]">${dico.t("BlockedFriends")}</h2>
                    <div id="blockedFriends" class="usersBloc scrollbar"></div>
                </div>
            </div>

        </div>
    </div>
    `;

    footer.style.display = "block";
    navbar(container, "friendsBtn");

    const allUsersEl = container.querySelector<HTMLDivElement>("#allUsers");
    const pendingFriendsEl = container.querySelector<HTMLDivElement>("#pendingFriends");
    const myFriendsEl = container.querySelector<HTMLDivElement>("#myFriends");
    const blockedFriendsEl = container.querySelector<HTMLDivElement>("#blockedFriends");
    if (!allUsersEl || !pendingFriendsEl || !myFriendsEl || !blockedFriendsEl) {
        console.error("missing content in friendspage");
        return;
    }
    const allUsersBloc: blocType = {
        el: allUsersEl,
        data: data.usersToAdd,
    };
    const pendingFriendsBloc: blocType = {
        el: pendingFriendsEl,
        data: data.usersPending,
    };
    const myFriendsBloc: blocType = {
        el: myFriendsEl,
        data: data.usersFriends,
    };
    const blockedFriendsBloc: blocType = {
        el: blockedFriendsEl,
        data: data.usersBlocked,
    };
    updateAllSections(container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc);

    ws_friendsPage(container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc);
};

