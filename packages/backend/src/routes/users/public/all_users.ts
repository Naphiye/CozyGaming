import { fastify } from "../../../server_config/server_setup.js";
import { db } from "../../../server_config/sqlite/db.js"
import { users, usersFriends } from "../../../server_config/sqlite/schema.js"
import { eq, ne, or } from "drizzle-orm";
import type { FastifyRequest, FastifyReply } from 'fastify';

import { translate } from '../../utils/translationBack.js';
import "../../../dico/larousse.js"
import { tokenHandler } from "../../tokens/tokenHandler.js";


export type usersType = { id: number, username: string, avatar: string, sendByAuthor: boolean, status: string };

export function createAllUsersRoute() {
    // list de tous les users
    fastify.get('/users', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);
        try {
            const { userId } = await tokenHandler(request, reply, t, false);
            // select tout mes amis
            const allFriends = await db.select().from(usersFriends)
                .where(or(
                    eq(usersFriends.smallerUserId, userId),
                    eq(usersFriends.greaterUserId, userId)
                ));

            // reunir tous les id de mes amis
            const allFriendsInfo = allFriends.map((user) => {
                const friendId = user.smallerUserId !== userId ? user.smallerUserId : user.greaterUserId;
                return { id: friendId, status: user.status, actionByUserId: user.actionByUserId };
            });

            // select tout le monde sauf moi
            const allUsers = await db
                .select({
                    id: users.id,
                    username: users.username,
                    avatar: users.avatar
                })
                .from(users)
                .where(ne(users.id, userId));

            // et la on tri dans 4 listes differentes grace a laccumulateur
            const { friends, pendingFriends, blockedFriends, notFriends } = allUsers.reduce(
                (acc, user) => {
                    const relation = allFriendsInfo.find(f => f.id === user.id);
                    // si lid quon regarde est dans les amis on lajoute en amis
                    if (relation) {
                        let user_w_senderBoolean: usersType = {
                            id: user.id,
                            username: user.username,
                            avatar: user.avatar,
                            sendByAuthor: relation.actionByUserId === userId,
                            status: relation.status
                        };
                        switch (relation.status) {
                            case "accepted":
                                acc.friends.push(user_w_senderBoolean);
                                break;
                            case "pending":
                                acc.pendingFriends.push(user_w_senderBoolean);
                                break;
                            case "blocked":
                                // si on ma bloquée le user napparait pas
                                // si cest moi jai bloqué le user apparait dans la rubrique bloquée
                                if (user_w_senderBoolean.sendByAuthor) {
                                    user_w_senderBoolean.avatar = "block-avatar.png";
                                    acc.blockedFriends.push(user_w_senderBoolean);
                                }
                                break;
                        }
                    } else {
                        const user_w_senderBoolean: usersType = {
                            id: user.id,
                            username: user.username,
                            avatar: user.avatar,
                            sendByAuthor: false,
                            status: "notfriend",
                        };
                        // sinon cest po notre pote
                        acc.notFriends.push(user_w_senderBoolean);
                    }
                    return acc;
                },
                {
                    friends: [] as usersType[], pendingFriends: [] as usersType[], blockedFriends: [] as usersType[], notFriends: [] as usersType[]
                }
            );

            return reply.code(200).send({ usersToAdd: notFriends, usersFriends: friends, usersPending: pendingFriends, usersBlocked: blockedFriends });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /users : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /users : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }

    });
}
