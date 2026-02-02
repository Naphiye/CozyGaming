import { ws } from "../../../../authentication/auth";
import { dico } from "../../../../dico/larousse";
import { confirmModalOneBtn } from "../../../DOM_helper";
import { fetchAddFriend } from "../fetch";
import { section_pendingFriends } from "../sections";
import type { BtnOptions } from "./formConfirm";


export function setupAddButtons(options: BtnOptions) {
    const {
        containerBlock,
        updateSection,
        container,
        allUsersBloc,
        pendingFriendsBloc,
        myFriendsBloc,
        blockedFriendsBloc,
    } = options;
    const allAddBtn = containerBlock.el.querySelectorAll<HTMLButtonElement>("#addFriendBtn");
    allAddBtn.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const add_user_id = Number(btn.dataset.userid);
            if (!add_user_id) {
                console.error("missing userid");
                return;
            }
            container.style.pointerEvents = "none";
            try {
                const new_pendingUser = await fetchAddFriend(add_user_id);

                if (containerBlock === allUsersBloc) {
                    // si fetch marche on enleve le user selectionné de la liste quon a deja
                    allUsersBloc.data = allUsersBloc.data.filter((user) => user.id !== add_user_id);
                    // on lajoute dans liste damis
                    pendingFriendsBloc.data = [...pendingFriendsBloc.data, new_pendingUser];
                } else {
                    pendingFriendsBloc.data = pendingFriendsBloc.data.filter((user) => user.id !== add_user_id);
                    myFriendsBloc.data = [...myFriendsBloc.data, new_pendingUser];
                }
                section_pendingFriends(container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc);
                updateSection(container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc);
                if (ws && ws.readyState === WebSocket.OPEN) {
                    // const data = `je tajoute en ami ${user.id}`;
                    const data = { state: "updateFriends", user: new_pendingUser.id, status: new_pendingUser.status };
                    ws.send(JSON.stringify(data));
                }
            } catch (err: any) {
                confirmModalOneBtn(dico.tRaw("actionFriendError"), err.message);
            } finally {
                container.style.pointerEvents = "auto";
            }
        });
    });
}


