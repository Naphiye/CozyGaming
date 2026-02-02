import websocket from "@fastify/websocket";
import { retrieveAllUsersId } from "./utils.js";
import { connectedUsers } from "../websocket.js";
import { eq } from "drizzle-orm";
import { users } from "../../sqlite/schema.js";
import { db } from "../../sqlite/db.js";

export type userOnline = {
    user: number,
    isOnline: boolean,
}
// arriving cest genre jarrive sur la page
// update cest genre je update la page
export type userUpdate = {
    state: string,
    status: string,
    username: string,
}

export function ws_handleMessage(t: (key: string) => string, id: number, socket: websocket.WebSocket) {
    // gerer les messages recus
    socket.on("message", async (rawMsg) => {
        const json_msg = JSON.parse(rawMsg.toString());
        // console.log("Message reçu :", json_msg);

        // le state update cest pour quand quelquun a trigger une action
        // ici ca concercne la page PROFILE FRIENDS
        if (json_msg.state === "updateFriends") {
            const userSenderDB = await db.select().from(users).where(eq(users.id, id));
            if (!userSenderDB[0]) {
                // on fait rien si celui qui envoie nexiste pas 
                return;
            }
            // le nouveau state du userSenderDB
            const new_stateFriendSender = {
                state: "updateFriends",
                username: userSenderDB[0].username,
                userToUpdate: userSenderDB[0].id,
                avatar: userSenderDB[0].avatar,
                status: json_msg.status
            }
            const new_statePublicSender: userUpdate = {
                state: "updatePublic",
                status: json_msg.status,
                username: userSenderDB[0].username,
            }
            // envoyer mon propre etat pour lupdate du mec
            // on envoie a lid recu la, lid qui envoie pour lupdate
            const wsTarget = connectedUsers.get(json_msg.user);
            if (wsTarget && wsTarget.size > 0) {
                const userSender: userOnline = {
                    user: userSenderDB[0].id,
                    isOnline: isUserConnected(userSenderDB[0].id),
                }
                // on envoie seulement a luser target
                wsTarget.forEach((socket) => {
                    try {
                        socket.send(JSON.stringify(new_stateFriendSender));
                        socket.send(JSON.stringify(new_statePublicSender));
                        socket.send(JSON.stringify(userSender));

                    } catch (err) {
                        console.warn(`Impossible d'envoyer aux sockets de l'utilisateur ${json_msg.user}:`, err);
                    }
                })
            }
            // envoyer a moi meme le updated letat de connexion du mec
            const wsSender = connectedUsers.get(userSenderDB[0].id);
            if (wsSender && wsSender.size > 0) {
                const userTarget: userOnline = {
                    user: json_msg.user,
                    isOnline: isUserConnected(json_msg.user),
                }
                wsSender.forEach((socket) => {
                    socket.send(JSON.stringify(userTarget));
                })
            }
        }

        if (json_msg.state === "updatePublic") {
            // envoyer a lid recu le nouveau state
            const wsUser = connectedUsers.get(json_msg.user);
            if (wsUser && wsUser.size > 0) {
                const userSenderDB = await db.select().from(users).where(eq(users.id, id));
                if (!userSenderDB[0]) {
                    // on fait rien si celui qui envoie nexiste pas 
                    return;
                }
                const new_statePublicSender: userUpdate = {
                    state: "updatePublic",
                    status: json_msg.status,
                    username: json_msg.username,
                }
                const new_stateFriendSender = {
                    state: "updateFriends",
                    username: userSenderDB[0].username,
                    userToUpdate: userSenderDB[0].id,
                    avatar: userSenderDB[0].avatar,
                    status: json_msg.status
                }
                const userSender: userOnline = {
                    user: userSenderDB[0].id,
                    isOnline: isUserConnected(userSenderDB[0].id),
                }
                // on envoie seulement a luser target
                wsUser.forEach((socket) => {
                    try {
                        socket.send(JSON.stringify(new_statePublicSender));
                        socket.send(JSON.stringify(new_stateFriendSender));
                        socket.send(JSON.stringify(userSender));
                    } catch (err) {
                        console.warn(`Impossible d'envoyer aux sockets de l'utilisateur ${json_msg.user}:`, err);
                    }
                })
            }
        }
        if (json_msg.state === "deleteAccount") {
            const new_state: userUpdate = {
                state: "updatePublic",
                status: "blocked",
                username: json_msg.username,
            }
            const new_stateFriends = {
                state: "updateFriends",
                username: json_msg.username,
                userToUpdate: json_msg.id,
                avatar: "",
                status: "blocked"
            }
            connectedUsers.forEach((sockets, userId) => {
                sockets.forEach(socket => {
                    if (userId === id) return; // ne pas envoyer au user qui supprime son compte
                    try {
                        socket.send(JSON.stringify(new_state));
                        socket.send(JSON.stringify(new_stateFriends));
                    } catch (err) {
                        console.warn(`Impossible d'envoyer aux sockets de l'utilisateur ${userId}:`, err);
                    }
                });
            });
        }

        // donc la cest quand jarrive sur les pages ca envoie un message avec le state arriving
        if (json_msg.state === "arriving") {
            if (json_msg.page === "friendsList") {
                const friends = await retrieveAllUsersId(id);
                // console.log("mes hops : ", friends);
                const friendsWStatus = await Promise.all(
                    friends.map(async (friend) => {
                        // toutes mes socket pour 1 user
                        const wsUser = connectedUsers.get(friend.id);
                        const user: userOnline = {
                            user: friend.id,
                            // si on a un set de websocket qui existe alors luser est connecté
                            isOnline: (wsUser && wsUser.size > 0) || false,
                        }
                        return user;
                    }));
                // get tous les status online
                // console.log("all my user connected or not : ", friendsWStatus);
                const state = {
                    state: "getAllStatus",
                    users: friendsWStatus,
                }
                socket.send(JSON.stringify(state));
            }
            // quand on arrive depuis la page public on recoit un msg
            if (json_msg.page === "publicPage") {
                const user: userOnline = {
                    user: json_msg.id,
                    isOnline: isUserConnected(json_msg.id),
                }
                // envoyer le state de LA PERSONNE DEMANDEE a la personne qui demande
                socket.send(JSON.stringify(user));
            }
        }
    });
}

function isUserConnected(id: number) {
    const idAllSocket = connectedUsers.get(id);
    if (!idAllSocket || idAllSocket.size === 0) {
        return false;
    }
    return true;
}

