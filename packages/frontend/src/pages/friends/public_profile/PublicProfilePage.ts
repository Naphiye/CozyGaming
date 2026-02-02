import { dico } from "../../../dico/larousse";
import { navigate } from "../../../router";
import { navbar } from "../../utils/navbar/navbar";
import { loadPage } from "../../DOM_helper";
import { fetchPongStats } from "../../pong/pongStat/fetchPongStat";
import { renderPongStats } from "../../pong/pongStat/renderPongStat";
import { outFriendsBtn } from "./utils/friendsBtn";
import { ws_publicPage } from "./utils/ws_publicPage";
import { auth } from "../../../authentication/auth";
import { ErrorPage } from "../../utils/404";

// fetch un user
async function fetchPublicInfo(username: string) {
    const lang = dico.getLanguage();
    const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
        credentials: "include",
        headers: {
            "Accept-Language": lang,
        },
    });
    const data = await res.json();
    if (!res.ok) {
        if (res.status === 498) {
            auth.setUser(false, false);
        }
        throw new Error(data.error || dico.tRaw("unknownError"));
    }
    return data.user;
}

export function chooseRelation(relationship: string, sendByAuthor: boolean) {
    let relationshipRes: string = "";
    switch (relationship) {
        case "myself":
            relationshipRes = dico.t("myselfRelationShip");
            break;
        case "accepted":
            relationshipRes = dico.t("friendRelationship");
            break;
        case "pending":
            if (sendByAuthor) { relationshipRes = dico.t("waitingPendingConfirmRelationship"); }
            else { relationshipRes = dico.t("answerPendingRelationship"); }
            break;
        case "notfriend":
            relationshipRes = dico.t("notFriendRelationship");
            break;
    }
    return relationshipRes;
}

export async function PublicProfilePage(container: HTMLDivElement, params: { username: string }) {
    const footer = document.querySelector<HTMLDivElement>("footer");
    if (!footer) {
        console.error("Footer not found in DashboardPage");
        return;
    }
    footer.style.display = "none";
    loadPage(container);

    // fetch si mon user exist sinon redirection vers 404
    let data: any | null = null;
    try {
        container.style.pointerEvents = "none";
        data = await fetchPublicInfo(params.username);
    } catch (error) {
        ErrorPage(container);
        return;
    } finally {
        container.style.pointerEvents = "auto";
    }
    const user: {
        id: number;
        username: string;
        avatar: string;
        sendByAuthor: boolean;
        relationship: string;
    } = data;
    if (!user) {
        return;
    }
    // Récupère les stats
    const stats = await fetchPongStats(user.username);

    container.innerHTML = `
    <div class="containerAllInCenter animateFade">
        <div class="relative p-[70px] pb-[100px] pt-20 w-[1150px] my-[100px] mt-[100px] ">
            <div class="absolute inset-0 bg-[rgba(255,246,239,0.9)] blur-lg rounded-[90px] -z-10"></div>

            <div class="flex flex-nowrap place-content-center items-center gap-x-[50px] mb-[60px]">
                <h1 class="titlePage pr-[35px] pl-[35px] p-[15px] min-w-fit">${dico.t("PublicProfilePage")}</h1>
                <div id="navbar"></div>
            </div>
                
                <div class=" flex justify-center">
                    <div class="bgUsers p-[30px] pr-10 pl-10 flex flex-col items-center max-w-fit">

                    <span title="${user.username}" class="titleFriends px-5  mb-2.5 text-[45px]">${user.username}</span>
                    <div class="grid grid-cols-[250px_1fr_2fr] gap-x-[35px] mt-[15px]">

                        <div class="bgAvatar h-[250px]">
                            <img src="/api/uploads/${user.avatar}?v=${Date.now()}" class="h-[210px] object-cover rounded-4xl border-2 border-[#ac7879]" alt="avatar" />
                        </div>

                        <div class="col-span-2 flex flex-col justify-center items-center ">
                            <div id="pongStat"></div>
                        </div>

                        <div class="flex flex-col place-content-center items-center w-full ">
                            <div class="titleFriends px-5 flex flex-col  items-center mt-[15px] mb-[15px]">
                                <div id="onlineStatus" class="flex items-center gap-x-2"></div>
                                <span id="friendshipStatus" class="text-center"></span>
                            </div>
                            <div id="friendRelationBtn" class="flex flex-col w-full"></div>
                        </div>

                        <div class="col-start-2 col-end-4 flex flex-col place-content-center items-center ">
                            <button id="matchHistoryBtn" class="matchHistoryBtn">
                                <img src="/assets/matchhistory.png" alt="matchhistory" class="w-34 pr-2" />
                                ${dico.t("MatchHistory")}
                            </button>
                        </div>
                        
                    </div>

                </div>
            </div>

        </div>
    </div>`;

    footer.style.display = "block";
    navbar(container);

    const friendRelationEl = container.querySelector<HTMLDivElement>("#friendRelationBtn");
    const matchHistoryBtn = container.querySelector<HTMLButtonElement>("#matchHistoryBtn");
    const onlineStatus = container.querySelector<HTMLDivElement>("#onlineStatus");
    const friendshipStatus = container.querySelector<HTMLSpanElement>("#friendshipStatus");
    if (!matchHistoryBtn || !friendRelationEl || !onlineStatus || !friendshipStatus) {
        console.error("missing content in publicpage");
        return;
    }
    renderPongStats(container, stats);

    matchHistoryBtn.addEventListener("click", () => navigate(`/matchHistory/${encodeURIComponent(user.username)}`));

    friendshipStatus.innerHTML = chooseRelation(user.relationship, user.sendByAuthor);

    // ajouter les bouton
    outFriendsBtn(container, friendRelationEl, user);

    ws_publicPage(container, friendshipStatus, friendRelationEl, onlineStatus, user.id);
}

// ce que le front ENVOIE au ws back, donc cest le front de celui qui fait laction
// quand il arrive sur la page
// const state = { state: "arriving", page: "friendsList"}
// quand il clique sur un bouton
// const data = { state: "update", user: user.id, status: friend.status };

// ce que le front RECOIT du back
// lorsque jarrive sur la  page cest la reponse a mon envoie state arriving
// const user: userOnline = {user: json_msg.id,isOnline: isUserConnected(json_msg.id),}
// lorsque quelquun a fait une action sur MOI, cest le front de celui qui subit laction, donc le bouton du front a été cliqué et update a été envoyé
// const new_state: userUpdate = { state: "update", status: json_msg.status }
// si un user se deco il notifie tout ses kheys donc on recoit sans envoyer quoi que ce soit
// const user: userOnline = {user: json_msg.id,isOnline: false,}
