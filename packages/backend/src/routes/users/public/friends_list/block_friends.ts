import { fastify } from "../../../../server_config/server_setup.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { translate } from "../../../utils/translationBack.js";
import { tokenHandler } from "../../../tokens/tokenHandler.js";
import { db } from "../../../../server_config/sqlite/db.js";
import { usersFriends } from "../../../../server_config/sqlite/schema.js";
import { eq, and } from "drizzle-orm";

import { retrieveUserTarget } from "./utils/retrieveUserTarget.js";

export function createBlockfriendsRoute() {
    fastify.post('/users/me/friends/block', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);
        try {
            const body = request.body as { userId: number };
            if (!body || !body.userId) {
                throw { code: 400, message: t("invalidData") };
            }

            const { userId } = await tokenHandler(request, reply, t, false);
            if (body.userId === userId) {
                throw { code: 409, message: t("cantBeFriendWithYourself") };
            }

            // on tri avec toujours un pattern de plus petit id < plus grand id
            const smallerId = userId < body.userId ? userId : body.userId;
            const greaterId = userId > body.userId ? userId : body.userId;
            // on cherche cette relation si elle existe dans notre table damis
            // verifier que luser target existe et on le recup, ya un throw si il exite pas
            const new_userWithType = await retrieveUserTarget(t, userId, smallerId, greaterId, true, "blocked");
            const existingFriends = await db
                .select()
                .from(usersFriends)
                .where(and(
                    eq(usersFriends.smallerUserId, smallerId),
                    eq(usersFriends.greaterUserId, greaterId)
                ));
            if (!existingFriends[0]) {
                await db.insert(usersFriends).values({
                    smallerUserId: smallerId,
                    greaterUserId: greaterId,
                    actionByUserId: userId,
                    status: "blocked",
                });
            }
            else {
                if (existingFriends[0].status === "blocked") {
                    throw { code: 409, message: t("cannotPerformAction") };
                }
                await db.update(usersFriends).set({ status: "blocked", actionByUserId: userId }).where(and(
                    eq(usersFriends.smallerUserId, smallerId),
                    eq(usersFriends.greaterUserId, greaterId)
                ));
            }

            return reply.code(200).send({ newUserBlocked: new_userWithType });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /users/me/friends/block : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /users/me/friends/block : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }
    });
}