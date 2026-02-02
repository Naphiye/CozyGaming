import { fastify } from "../../server_config/server_setup.js";
import { translate } from "../utils/translationBack.js";

import type { FastifyRequest, FastifyReply } from 'fastify';
import { db } from "../../server_config/sqlite/db.js"
import { users } from "../../server_config/sqlite/schema.js"
import { eq } from "drizzle-orm";
import { tokenHandler } from "../tokens/tokenHandler.js";


export function createAliasValidationRoute() {
    fastify.post('/pong/aliasvalidation', async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request); // traductions côté back
        try {

            const body = request.body as { alias: string };
            if (!body || !body.alias) {
                throw { code: 400, message: t("invalidData") };
            }
            await tokenHandler(request, reply, t, false);

            const alias = body.alias.trim() || "";

            // Vérifications côté serveur
            if (!alias) {
                throw { code: 400, message: t("EnterLoginAlert") };
            }

            // Vérifier si l'alias existe déjà dans la DB
            const existingUser = await db
                .select()
                .from(users)
                .where(eq(users.username, alias));

            if (existingUser.length > 0) {
                throw { code: 409, message: t("usernameLinkedToRegisteredAccount") };
            }

            // Si tout est ok
            return reply.code(200).send({ valid: true });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /pong/aliasvalidation : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /pong/aliasvalidation : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }
    });
}
