import { section_blockedFriends } from "../sections";
import { fetchBlockFriend } from "../fetch";
import { confirmFriendActionForm, type BtnOptions, type trad } from "./formConfirm";
import { ws } from "../../../../authentication/auth";
import { confirmModalOneBtn } from "../../../DOM_helper";
import { dico } from "../../../../dico/larousse";

export function setupBlockButtons(options: BtnOptions) {
    const {
        containerBlock
    } = options;
    const allBlockedBtn = containerBlock.el.querySelectorAll<HTMLButtonElement>("#blockedFriendBtn");
    allBlockedBtn.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const block_user_id = Number(btn.dataset.userid);
            const userLooked = containerBlock.data.find((user) => user.id === block_user_id);
            if (!block_user_id || !userLooked) {
                console.error("missing userid or in the bloctype");
                return;
            }
            const user = {
                username: userLooked.username,
                id: userLooked.id
            }
            const trad: trad = {
                titleForm: "BlockSomebody",
                contentForm: "BlockSomebodyForm",
                actionBtn: "block",
                noActionBtn: "closeBtn"
            }
            confirmFriendActionForm(user, options, trad, () => blockSomeone(options, block_user_id));
        });
    });
}

async function blockSomeone(options: BtnOptions, block_user_id: number) {
    const {
        containerBlock,
        updateSection,
        container,
        allUsersBloc,
        pendingFriendsBloc,
        myFriendsBloc,
        blockedFriendsBloc,
    } = options;

    container.style.pointerEvents = "none";
    try {
        const blockedUser = await fetchBlockFriend(block_user_id);
        // retirer le user id de notre liste visée de base
        containerBlock.data = containerBlock.data.filter((user) => user.id !== block_user_id);
        // rajouter luser quon a enlevé dans la liste des amis a ajouter
        blockedFriendsBloc.data = [...blockedFriendsBloc.data, blockedUser];
        section_blockedFriends(container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc);
        updateSection(container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc);
        if (ws && ws.readyState === WebSocket.OPEN) {
            // const data = `je tajoute en ami ${user.id}`;
            const data = { state: "updateFriends", user: blockedUser.id, status: blockedUser.status };
            ws.send(JSON.stringify(data));
        }
    } catch (err: any) {
        confirmModalOneBtn(dico.tRaw("actionFriendError"), err.message);
    } finally {
        container.style.pointerEvents = "auto";
    }

}