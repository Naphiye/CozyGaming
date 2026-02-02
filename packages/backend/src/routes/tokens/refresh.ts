import { fastify } from "../../server_config/server_setup.js";
import type { FastifyRequest, FastifyReply } from 'fastify';
// import pour traduire
import { translate } from '../utils/translationBack.js';
import "../../dico/larousse.js"

import { tokenHandler } from "./tokenHandler.js";

import { db } from "../../server_config/sqlite/db.js";
import { users } from "../../server_config/sqlite/schema.js";
import { eq } from "drizzle-orm";

export function createaccessTokensRoute() {
    fastify.get("/access_token", async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);

        try {
            // time();
            const { userId } = await tokenHandler(request, reply, t, false);

            const user = await db.select().from(users).where(eq(users.id, userId));
            if (!user[0]) {
                throw { code: 401, message: t("unauthorized") };
            }
            return reply.code(200).send({ message: t("accessOK"), user: { id: userId, lang: user[0].lang } });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /access_token : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }
    });
}

