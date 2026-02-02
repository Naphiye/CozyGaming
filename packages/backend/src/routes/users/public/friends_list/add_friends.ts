import { fastify } from "../../../../server_config/server_setup.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { translate } from "../../../utils/translationBack.js";
import { tokenHandler } from "../../../tokens/tokenHandler.js";
import { db } from "../../../../server_config/sqlite/db.js";
import { usersFriends } from "../../../../server_config/sqlite/schema.js";
import { eq, and } from "drizzle-orm";

import { retrieveUserTarget } from "./utils/retrieveUserTarget.js";

export function createAddfriendsRoute() {
    fastify.post('/users/me/friends/add', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
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
            let new_userWithType = await retrieveUserTarget(t, userId, smallerId, greaterId, false, "notfriend");

            const existingFriends = await db
                .select()
                .from(usersFriends)
                .where(and(
                    eq(usersFriends.smallerUserId, smallerId),
                    eq(usersFriends.greaterUserId, greaterId)
                ));
            if (!existingFriends[0]) {
                // ajouter lami si on existe pas dans la table friends
                await db.insert(usersFriends).values({
                    smallerUserId: smallerId,
                    greaterUserId: greaterId,
                    actionByUserId: userId,
                    status: "pending",
                });
                new_userWithType.status = "pending";
            }
            if (existingFriends[0]) {
                // si on est block ou deja accepted je dois refuser
                // si cest moi qui fait laction je refuse
                if (existingFriends[0].status === "accepted" || existingFriends[0].status === "blocked" || existingFriends[0].actionByUserId === userId) {
                    throw { code: 409, message: t("cannotPerformAction") };
                }
                // update en on est ami si cest pas moi qui ait fait laction de base, et je dis que jai fait laction
                await db.update(usersFriends).set({ status: "accepted", actionByUserId: userId }).where(and(
                    eq(usersFriends.smallerUserId, smallerId),
                    eq(usersFriends.greaterUserId, greaterId)
                ));
                new_userWithType.status = "accepted";
            }

            return reply.code(201).send({ newUserAdded: new_userWithType });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /users/me/friends/add : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /users/me/friends/add : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }
    });
}
