import { fastify } from "../../../../server_config/server_setup.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { translate } from "../../../utils/translationBack.js";
import { tokenHandler } from "../../../tokens/tokenHandler.js";
import { db } from "../../../../server_config/sqlite/db.js";
import { usersFriends } from "../../../../server_config/sqlite/schema.js";
import { eq, and } from "drizzle-orm";
import { retrieveUserTarget } from "./utils/retrieveUserTarget.js";

export function createRemovefriendsRoute() {
    fastify.delete('/users/me/friends/remove', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
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

            const smallerId = userId < body.userId ? userId : body.userId;
            const greaterId = userId > body.userId ? userId : body.userId;
            const new_userWithType = await retrieveUserTarget(t, userId, smallerId, greaterId, false, "notfriend");

            const existingFriends = await db
                .select()
                .from(usersFriends)
                .where(and(
                    eq(usersFriends.smallerUserId, smallerId),
                    eq(usersFriends.greaterUserId, greaterId)
                ));
            if (!existingFriends[0]) {
                throw { code: 404, message: t("usersAreNotFriends") };
            }

            // delete lami
            await db.delete(usersFriends).where(and(
                eq(usersFriends.smallerUserId, smallerId),
                eq(usersFriends.greaterUserId, greaterId)));


            return reply.code(200).send({ user: new_userWithType });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /users/me/friends/remove : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /users/me/friends/remove : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }
    });
}