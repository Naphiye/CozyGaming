import { ws } from "../../../../authentication/auth";
import { dico } from "../../../../dico/larousse";
import { navigate } from "../../../../router";
import { chooseRelation } from "../PublicProfilePage";
import { outFriendsBtn } from "./friendsBtn";

export function ws_publicPage(container: HTMLDivElement, friendshipStatus: HTMLSpanElement, friendRelationEl: HTMLDivElement, onlineStatus: HTMLDivElement, userLookedId: number) {
    // se connecter a la websocket pour louverture damis
    if (!ws) {
        return;
    }
    // quand on arrive sur la page ca envoie un msg a la websocket pour voir si la page quon regarde le mec est connecté
    if (ws.readyState === WebSocket.OPEN) {
        const state = {
            state: "arriving",
            page: "publicPage",
            id: userLookedId,
        }
        ws.send(JSON.stringify(state));
    }
    // et ici cest toutes les reponses des websocket seront get ici
    ws.onmessage = (event) => {
        const json_msg = JSON.parse(event.data);
        // si le mec me bloque
        if (json_msg.status === "blocked") {
            if( friendshipStatus.innerHTML !== dico.t("myselfRelationShip")){
                navigate("/friends");
            }
            return;
        }
        // je renvoie le user id que quand il se connecte
        if (json_msg.user === userLookedId) {
            writeOnlineStatus(onlineStatus, json_msg.isOnline);
        }
        // update cest pour quand on trigger une action par les boutons, si on est le sender ya deja les sections qui update
        if (json_msg.state === "updatePublic") {
            if( friendshipStatus.innerHTML !== dico.t("myselfRelationShip")){                
                // pourquoi sendbyauthor false ? car si on recoit un message ca veut dire que cest forcemenet pas nous qui avons trigger laction
                outFriendsBtn(container, friendRelationEl, { id: userLookedId, username: json_msg.username, sendByAuthor: false, relationship: json_msg.status });
                friendshipStatus.innerHTML = chooseRelation(json_msg.status, json_msg.sendByAuthor);
            }
            return;
        }
    }
}

function writeOnlineStatus(element: HTMLDivElement, isOnline: boolean) {
    if (isOnline) {
        element.innerHTML = `<span>${dico.tRaw("isOnlineStatus")}</span> <span class="ml-1 relative flex place-content-center items-center">
                            <span class="absolute statusOnline "></span>
                            <span class="absolute statusOnlineAnimate " title="${dico.tRaw(" onlineStatus")}"></span>
                        </span>`;
    } else {
        element.innerHTML = `<span>${dico.tRaw("isOfflineStatus")}</span> <span class="statusOffline" title="${dico.tRaw("offlineStatus")}"></span>`;
    }
}