// import websocket from "@fastify/websocket";
import { connectedUsers } from "../websocket.js";
import { db } from "../../sqlite/db.js";
import { eq, or } from "drizzle-orm";

import { users, usersFriends } from "../../sqlite/schema.js";
import { fastify } from "../../server_setup.js";
import type { FastifyRequest } from "fastify";
import type { userOnline } from "./handleMessage.js";

export function extractUserIdHotJwt(t: (key: string) => string, request: FastifyRequest) {
    const clientHotToken = request.cookies?.access ?? null;
    if (!clientHotToken) {
        throw { code: 401, message: t("unauthorized") };
    }
    const hotDecoded = fastify.jwt.verify(clientHotToken);
    return hotDecoded as { id: number };
}

export async function retrieveAllUsersId(id: number) {
    // chercher tous les gens avec qui je peux interagir et renvoyer une liste d'id
    const allMyFriends = await db.select().from(usersFriends)
        .where(or(
            eq(usersFriends.smallerUserId, id),
            eq(usersFriends.greaterUserId, id)
        ));

    // on met tous les id et leur status 
    // donc cest tous les gens avec qui jai une relation
    const allFriendsInfo = allMyFriends.map((user) => {
        const friendId = user.smallerUserId !== id ? user.smallerUserId : user.greaterUserId;
        return { id: friendId, status: user.status, };
    });

    // select tout le monde et moi avec car faut savoir si je suis en ligne aussi
    const allUsers = await db
        .select({
            id: users.id,
            username: users.username,
        }).from(users);
    // et la on va trier grace a laccumulateur et recuperer seulement les gens avec qui on a aucune relation ou pending
    const { allUsersId } = allUsers.reduce((acc, user) => {
        const relation = allFriendsInfo.find(f => f.id === user.id);
        // si la relation existe et quon est bloqué on ajoute pas
        if (relation && relation.status === "blocked") {
            return acc;
        }
        acc.allUsersId.push({ id: user.id });
        return acc;
    },
        { allUsersId: [] as { id: number }[] }
    );

    return allUsersId;
}

async function doIhaveAnyFriend(id: number) {
    const allRelationship = await db.select().from(usersFriends).where(or(eq(usersFriends.smallerUserId, id), eq(usersFriends.greaterUserId, id)));
    if (allRelationship.length === 0) {
        return false;
    }
    return true;
}

export async function sendOnlineStatusAllUsers(id: number, isOnline: boolean, isConnexion: boolean) {
    const user: userOnline = {
        user: id,
        isOnline: isOnline,
    }
    const friends = await retrieveAllUsersId(id);
    const userSenderDB = await db.select().from(users).where(eq(users.id, id));
    if (!userSenderDB[0]) {
        return; // ne rien faire si on trouve pas luser sender
        // throw { code: 401, message: "impossible de trouver le usersender de l'utilisateur dans la db" };
    }
    const iHaveFriends = await doIhaveAnyFriend(id);
    const new_stateFriendSender = {
        state: "updateFriends",
        username: userSenderDB[0].username,
        userToUpdate: userSenderDB[0].id,
        avatar: userSenderDB[0].avatar,
        status: "notfriend"
    }
    // console.log("mes hops : ", friends);
    friends.forEach(async (friend) => {
        // toutes mes socket pour 1 user
        const wsUser = connectedUsers.get(friend.id);
        // si on a un set de websocket qui existe alors luser est connecté
        if (wsUser && wsUser.size > 0) {
            // console.log("user id ", i.id, " is connected");
            wsUser.forEach((socket) => {
                if (!iHaveFriends && isConnexion) { socket.send(JSON.stringify(new_stateFriendSender)); }
                socket.send(JSON.stringify(user));
                // si jai pas de relation jenvoie mon profil genre ajoutez moi svp je vous envoie mon profil au cas ou jexiste pa dans vos amis
                // console.log("socker by user id ", i );
            })
        }
    });
}