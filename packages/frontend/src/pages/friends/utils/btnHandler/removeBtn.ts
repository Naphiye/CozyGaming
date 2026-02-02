import { section_allUsers } from "../sections";
import { fetchRemoveFriend } from "../fetch";
import { ws } from "../../../../authentication/auth";
import { confirmFriendActionForm, type BtnOptions, type trad } from "./formConfirm";
import { confirmModalOneBtn } from "../../../DOM_helper";
import { dico } from "../../../../dico/larousse";



export function setupRemoveButtons(options: BtnOptions) {
    const {
        containerBlock,
        myFriendsBloc,
    } = options;
    const allRemoveBtn = containerBlock.el.querySelectorAll<HTMLButtonElement>("#removeFriendBtn");
    allRemoveBtn.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const remove_user_id = Number(btn.dataset.userid);
            const userLooked = containerBlock.data.find((user) => user.id === remove_user_id);

            if (!remove_user_id || !userLooked) {
                console.error("missing userid or in the bloctype");
                return;
            }
            if (containerBlock !== myFriendsBloc) {
                try {
                    await removeFriend(options, remove_user_id);
                } catch (err: any) {
                    confirmModalOneBtn(dico.tRaw("actionFriendError"), err.message);
                }
                return;
            }
            const user = {
                username: userLooked.username,
                id: userLooked.id
            }
            const trad: trad = {
                titleForm: "RemoveSomebody",
                contentForm: "removeFriendForm",
                actionBtn: "delete",
                noActionBtn: "dontRemoveBtn"
            }
            confirmFriendActionForm(user, options, trad, () => removeFriend(options, remove_user_id))
        });
    });
}

async function removeFriend(options: BtnOptions, remove_user_id: number) {
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
        const removedUser = await fetchRemoveFriend(remove_user_id);
        // retirer le user id de notre liste visée de base
        containerBlock.data = containerBlock.data.filter((user) => user.id !== remove_user_id);
        // rajouter luser quon a enlevé dans la liste des amis a ajouter
        allUsersBloc.data = [...allUsersBloc.data, removedUser];
        section_allUsers(container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc);
        updateSection(container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc);
        if (ws && ws.readyState === WebSocket.OPEN) {
            const data = { state: "updateFriends", user: removedUser.id, status: removedUser.status };
            ws.send(JSON.stringify(data));
        }
    } catch (err: any) {
        confirmModalOneBtn(dico.tRaw("actionFriendError"), err.message);
    } finally {
        container.style.pointerEvents = "auto";
    }
}

