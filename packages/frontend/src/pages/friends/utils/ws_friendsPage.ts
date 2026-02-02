import { ws } from "../../../authentication/auth";
import { onlineStatusDot, type blocType, type usersType } from "../FriendsPage";
import { updateAllSections } from "./sections";


export function ws_friendsPage(container: HTMLDivElement, allUsersBloc: blocType, pendingFriendsBloc: blocType, myFriendsBloc: blocType, blockedFriendsBloc: blocType) {
    // se connecter a la websocket pour louverture damis
    if (!ws) {
        return;
    }
    if (ws.readyState === WebSocket.OPEN) {
        const state = {
            state: "arriving",
            page: "friendsList",
        }
        ws.send(JSON.stringify(state));
    }
    ws.onmessage = (event) => {
        const json_msg = JSON.parse(event.data);
        // on cherche notre user dans quel section il est
        // si jai un user id dans mon json on update son status online
        const blocs = [
            allUsersBloc,
            pendingFriendsBloc,
            myFriendsBloc,
            blockedFriendsBloc
        ];

        if (json_msg.state === "updateFriends") {
            // je creer un user avec un usertype car si la personne nous a bloqué notre ui ne possede plus luser
            userTargetedMe(json_msg, container, blocs);
        }

        // quelquun envoie un update online
        if (json_msg.user) {
            for (const bloc of blocs) {
                const index = bloc.data.findIndex(u => u.id === json_msg.user);
                if (index !== -1) {
                    outUserOnlineStatus(container, { id: bloc.data[index].id, isOnline: json_msg.isOnline });
                }
            }
        }
        // si jarrive sur la page faut que je get tous les status des gens
        if (json_msg.state === "getAllStatus") {
            // parcourir mes listes
            for (const bloc of blocs) {
                // parcourir chaque user dans chaque liste
                for (const userLooked of bloc.data as usersType[]) {
                    // chercher luser et si on le trouve on update son status
                    const statusInfo = json_msg.users.find((user: { user: number, isOnline: boolean }) => user.user === userLooked.id);
                    if (statusInfo) {
                        outUserOnlineStatus(container, { id: statusInfo.user, isOnline: statusInfo.isOnline });

                    }
                }
            }
        }
    }
}

function outUserOnlineStatus(container: HTMLDivElement, user: { id: number, isOnline: boolean }) {
    const statusOnlineDiv = container.querySelector<HTMLDivElement>(`#onlineStatus${user.id}`)
    if (statusOnlineDiv) {
        statusOnlineDiv.innerHTML = onlineStatusDot(user.isOnline);
    }
}

function userTargetedMe(json_msg: any, container: HTMLDivElement,
    blocs: blocType[]) {
    // je creer un user avec les info recu dans le cas ou on maurait bloqué il nexiste plus dans mes listes
    let user: usersType = {
        id: json_msg.userToUpdate,
        username: json_msg.username,
        avatar: json_msg.avatar,
        sendByAuthor: false
    }
    // si on est bloqué ca va juste teij le truc et si on est pas bloqué ca va juste le rajouter
    for (const bloc of blocs) {
        const index = bloc.data.findIndex(u => u.id === json_msg.userToUpdate);
        if (index !== -1) {
            // donc si je demande a faire changer le bloc all user et quen plus cest le msg not friend => alors jai recu un update de 1ere connexion
            if (bloc === blocs[0] && json_msg.status === "notfriend") {
                // console.log("je sui pa nouvo compte")
                return;
            }
            user = bloc.data[index];
            bloc.data.splice(index, 1);
        }
    }
    switch (json_msg.status) {
        case "notfriend":
            blocs[0].data.push(user);
            break;
        case "pending":
            user.sendByAuthor = false;
            blocs[1].data.push(user);
            break;
        case "accepted":
            blocs[2].data.push(user);
            break;
    }
    updateAllSections(container, blocs[0], blocs[1], blocs[2], blocs[3]);
}