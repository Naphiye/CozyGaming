import { ws } from "../../../../authentication/auth";
import { dico } from "../../../../dico/larousse";
import { navigate } from "../../../../router";
import { confirmFormTwoBtn, confirmModalOneBtn } from "../../../DOM_helper";
import { EmptyModal } from "../../../modal/EmptyModal";
import { fetchAddFriend, fetchBlockFriend, fetchRemoveFriend } from "../../utils/fetch";
import type { trad } from "../../utils/btnHandler/formConfirm";

export function outFriendsBtn(container: HTMLDivElement, friendRelationEl: HTMLDivElement, user: { id: number, username: string, sendByAuthor: boolean, relationship: string }) {
    let addStr: string = "";
    let addBtnExist: boolean = false;
    let supprStr: string = "";
    let supprBtnExist: boolean = false;
    const blockStr = dico.t("block");
    let titleSuppr: string = "";
    // gerer le texte a linterieur des boutons et leurs presences
    switch (user.relationship) {
        case "myself":
            return ``;
        case "accepted":
            supprBtnExist = true;
            supprStr = dico.t("RemoveFriendship");
            titleSuppr = dico.tRaw("RemoveFriendship");
            break;
        case "pending":
            supprBtnExist = true;
            supprStr = dico.t("cancel");
            titleSuppr = dico.tRaw("cancel");
            if (!user.sendByAuthor) {
                addBtnExist = true;
                addStr = dico.t("AcceptFriendship");
            }
            break;
        case "notfriend":
            addStr = dico.t("AddFriendship");
            addBtnExist = true;
            supprBtnExist = false;
            break;
    }

    friendRelationEl.innerHTML = `${addBtnExist ? `<button id="addBtn" title="${dico.tRaw("titleAddUser")}" class="AddFriendPublicBtn items-center mb-2.5">${addStr}</button>` : ``}
    ${supprBtnExist ?
            `<div class="flex justify-between  items-center gap-x-2.5">
            <button id="blockBtn" title="${dico.tRaw("block")}" class="deactivateBtn w-1/2 ">${blockStr}</button>
            <button id="supprBtn" title="${titleSuppr}" class="SupprPublicBtn  w-1/2 ">${supprStr}</button>
        </div>`
            :
            `<div class="flex items-center justify-center">
            <button id="blockBtn" title="${dico.tRaw("block")}" class="deactivateBtn w-1/2 ">${blockStr}</button>
        </div>`}
    `;

    const friendshipStatus = container.querySelector<HTMLSpanElement>("#friendshipStatus");
    if (!friendshipStatus) {
        console.error("missing content in publicpage");
        return;
    }
    const userSend = { id: user.id, username: user.username };
    const friendsElements = { friendRelationEl, friendshipStatus }
    // attacher leurs listeners
    const addBtn = friendRelationEl.querySelector<HTMLButtonElement>("#addBtn");
    if (addBtn) {
        addBtn.addEventListener("click", async () => {
            container.style.pointerEvents = "none";
            try {
                // fetch ajouter un ami
                const friend = await fetchAddFriend(user.id);
                outFriendsBtn(container, friendRelationEl, { id: user.id, username: user.username, sendByAuthor: true, relationship: friend.status })
                if (friend.status === "pending") {
                    friendshipStatus.innerHTML = dico.t("waitingPendingConfirmRelationship");
                } else {
                    friendshipStatus.innerHTML = dico.t("friendRelationship");
                }
                // donc la je dois trigger la ws de luser.id pour que son state supdate
                if (ws && ws.readyState === WebSocket.OPEN) {
                    // const data = `je tajoute en ami ${user.id}`;
                    const data = { state: "updatePublic", user: user.id, username: user.username, status: friend.status };
                    ws.send(JSON.stringify(data));
                }
            } catch (err: any) {
                confirmModalOneBtn(dico.tRaw("actionFriendError"), err.message);
            } finally {
                container.style.pointerEvents = "auto";
            }
        });
    }

    const supprBtn = friendRelationEl.querySelector<HTMLButtonElement>("#supprBtn");
    if (supprBtn) {
        supprBtn.addEventListener("click", async () => {
            /* si on est pas pote on a pas besoin de louverture de confirmation du modal donc on lance direct le fetch*/
            if (user.relationship !== "accepted") {
                try {
                    await removeFriendPublicPage(container, userSend, friendsElements);
                } catch (err: any) {
                    confirmModalOneBtn(dico.tRaw("actionFriendError"), err.message);
                }
                return;
            }

            const trad: trad = {
                titleForm: "RemoveSomebody",
                contentForm: "removeFriendForm",
                actionBtn: "delete",
                noActionBtn: "dontRemoveBtn"
            }
            confirmPublicActionForm(container, trad, userSend,
                () => removeFriendPublicPage(container, userSend, friendsElements),
                { friendRelationEl, friendshipStatus });
        });
    }

    const blockBtn = friendRelationEl.querySelector<HTMLButtonElement>("#blockBtn");
    if (blockBtn) {
        blockBtn.addEventListener("click", async () => {
            const trad: trad = {
                titleForm: "BlockSomebody",
                contentForm: "BlockSomebodyForm",
                actionBtn: "block",
                noActionBtn: "closeBtn"
            }
            confirmPublicActionForm(container, trad, userSend,
                () => blockFriendPublicPage(container, userSend));
        });
    }
}

async function confirmPublicActionForm(container: HTMLDivElement,
    trad: trad,
    user: { id: number, username: string },
    fn: (container: HTMLDivElement,
        user: { id: number, username: string },
        friendEl?: { friendRelationEl: HTMLDivElement, friendshipStatus: HTMLSpanElement }) => Promise<void>,
    friendEl?: { friendRelationEl: HTMLDivElement, friendshipStatus: HTMLSpanElement }) {

    const form = document.createElement('div');

    form.innerHTML = confirmFormTwoBtn(trad, user.username);

    // Création du modal
    const modal = EmptyModal({
        title: dico.t(trad.titleForm),
        children: form
    });

    const actionBtn = modal.querySelector<HTMLButtonElement>("#actionBtn");
    const noActionBtn = modal.querySelector<HTMLButtonElement>("#noActionBtn");

    if (!actionBtn || !noActionBtn) {
        console.error("missing content for confirmFriendActionForm");
        return;
    }

    noActionBtn.addEventListener("click", async () => {
        modal.close();
    });

    actionBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        modal.close();
        try {
            if (friendEl !== undefined) {
                await fn(container, user, friendEl);
            } else {
                await fn(container, user);
            }
        } catch (err: any) {
            form.innerHTML = err.message;
        }
    });
}

async function removeFriendPublicPage(container: HTMLDivElement,
    user: { id: number, username: string },
    friendEl: { friendRelationEl: HTMLDivElement, friendshipStatus: HTMLSpanElement },) {
    container.style.pointerEvents = "none";
    try {
        // fetch enlever un ami
        await fetchRemoveFriend(user.id);
        outFriendsBtn(container, friendEl.friendRelationEl, { id: user.id, username: user.username, sendByAuthor: true, relationship: "notfriend" })
        friendEl.friendshipStatus.innerHTML = dico.t("notFriendRelationship");
        if (ws && ws.readyState === WebSocket.OPEN) {
            const data = { state: "updatePublic", user: user.id, status: "notfriend" };
            ws.send(JSON.stringify(data));
        }
    } catch (err: any) {
        console.error(err.message);
    } finally {
        container.style.pointerEvents = "auto";
    }
}

async function blockFriendPublicPage(container: HTMLDivElement, user: { id: number, username: string }) {
    container.style.pointerEvents = "none";
    try {
        // fetch enlever un ami
        await fetchBlockFriend(user.id);
        if (ws && ws.readyState === WebSocket.OPEN) {
            const data = { state: "updatePublic", user: user.id, status: "blocked" };
            ws.send(JSON.stringify(data));
        }
        navigate("/friends");
    } catch (err: any) {
        console.error(err.message);
    } finally {
        container.style.pointerEvents = "auto";
    }
}