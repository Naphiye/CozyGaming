import { fastify } from "../../../server_config/server_setup.js";
import { db } from "../../../server_config/sqlite/db.js"
import { users, usersFriends } from "../../../server_config/sqlite/schema.js"
import { eq, and } from "drizzle-orm";
import type { FastifyRequest, FastifyReply } from 'fastify';

import { translate } from '../../utils/translationBack.js';
import "../../../dico/larousse.js"
import { tokenHandler } from "../../tokens/tokenHandler.js";


export async function getRelationship(userId: number, user_target: number) {
    // verifier si je suis bloquée je renvoie un 404
    const smallerId = userId < user_target ? userId : user_target;
    const greaterId = userId > user_target ? userId : user_target;
    const existingFriends = await db
        .select()
        .from(usersFriends)
        .where(and(
            eq(usersFriends.smallerUserId, smallerId),
            eq(usersFriends.greaterUserId, greaterId)
        ));

    return { status: existingFriends[0]?.status || "notfriend", sendByAuthor: existingFriends[0]?.actionByUserId === userId || false };
}

export function createOneUserRoute() {
    // get un user en particulier pour public profile
    fastify.get('/users/:username', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);
        try {
            const { username } = request.params as { username: string };
            if (!username) {
                throw { code: 400, message: t("invalidData") };
            }
            const { userId } = await tokenHandler(request, reply, t, false);

            const userAsked = await db
                .select()
                .from(users)
                .where(eq(users.username, username));

            if (!userAsked[0]) {
                throw { code: 404, message: t("userNotFound") };
            }

            let res = await getRelationship(userId, userAsked[0].id)
            if (res.status === "blocked") {
                throw { code: 404, message: t("userNotFound") };
            }

            const isMyself = userAsked[0].id === userId;
            if (isMyself) {
                res.status = "myself";
            }
            return reply.code(200).send({
                user: {
                    id: userAsked[0].id,
                    username: userAsked[0].username,
                    avatar: userAsked[0].avatar,
                    sendByAuthor: res.sendByAuthor,
                    relationship: res.status
                }
            });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /users/:username : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /users/:username : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }

    });
}