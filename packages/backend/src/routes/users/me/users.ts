import { fastify } from "../../../server_config/server_setup.js";
import fs from "fs/promises";
import path from "path";
import { db } from "../../../server_config/sqlite/db.js"
import { users } from "../../../server_config/sqlite/schema.js"
import { eq } from "drizzle-orm";
import type { FastifyRequest, FastifyReply } from 'fastify';

import "../../../dico/larousse.js"
import { translate } from '../../utils/translationBack.js';
import { tokenHandler } from "../../tokens/tokenHandler.js";
import { uploadsPath } from "../../../server_config/server_setup.js";

export function createUserMeRoutes() {
    fastify.get("/users/me", { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);

        try {
            const { userId } = await tokenHandler(request, reply, t, false);

            const result = await db
                .select({
                    id: users.id,
                    username: users.username,
                    email: users.email,
                    avatar: users.avatar,
                    isOAuth: users.isOAuth,
                    lang: users.lang,
                    twoFA: users.twoFA
                })
                .from(users)
                .where(eq(users.id, userId));

            const user = result?.[0];
            if (!user)
                throw { code: 401, message: t("unauthorized") };

            return reply.code(200).send({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                    isOAuth: user.isOAuth,
                    lang: user.lang,
                    twoFA: user.twoFA
                },
            });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /users/me : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /users/me : ", error);
            return reply.code(500).send({ error: t("getuserMeError") });
        }
    });

    fastify.delete("/users/me/delete", { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);
        try {
            const { userId } = await tokenHandler(request, reply, t, true); // true comme ca on check et on renvoie pas de token comme dans logout

            const userAsked = await db
                .select()
                .from(users)
                .where(eq(users.id, userId));

            const user = userAsked[0];
            if (!user) {
                throw { code: 404, message: t("userNotFound") };
            }

            const filePath = path.join(uploadsPath, user.avatar);
            try {
                if (user.avatar === "default-avatar.png" || user.avatar.includes("defaults_users/")) {
                    throw new Error("Avatar is a default image, cannot delete file.");
                }
                console.log("Deleting avatar file at path: ", filePath);
                await fs.unlink(filePath); // supprime le fichier
            } catch (err) {
                console.warn("Impossible de supprimer l'image : ", err);
            }

            await db.delete(users).where(eq(users.id, user.id));

            return reply.code(200).send({ success: t("deletionSuccess") });
        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /users/me/delete : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /users/me/delete : ", error);
            return reply.code(500).send({ error: t("deletionFailed") });
        }
    });
}

