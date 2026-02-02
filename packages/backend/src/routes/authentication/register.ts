import { fastify } from "../../server_config/server_setup.js";
import type { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from "bcrypt";
import { eq, or } from "drizzle-orm";

import { db } from "../../server_config/sqlite/db.js"
import { users } from "../../server_config/sqlite/schema.js"
import { translate } from '../utils/translationBack.js';
import "../../dico/larousse.js"
import { dico } from "../../dico/larousse.js";

export function createRegisterRoute() {
    fastify.post('/register', { config: { rateLimit: { max: 15, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);
        try {
            const body = request.body as {
                username: string;
                password: string;
                email: string;
            };
            if (!body || !body.username || !body.password || !body.email) {
                throw { code: 400, message: t("invalidData") };
            }
            const existingUser = await db
                .select()
                .from(users)
                .where(or(
                    eq(users.username, body.username),
                    eq(users.email, body.email)
                ));
            if (existingUser.length > 0) {
                throw { code: 409, message: t("usernameOrEmailIsWrong") };
            }
            const hashedPassword = await bcrypt.hash(body.password, 10);
            const lang = dico.myLang();
            const result = await db.insert(users).values({
                username: body.username,
                passwordHash: hashedPassword,
                email: body.email,
                lang: lang,
                isOAuth: false,
            }).returning();

            const newUser = result[0];
            if (!newUser) {
                console.error("❌ Échec de la création de l'utilisateur pour le nom d'utilisateur : ", body.username);
                throw { code: 400, message: t("invalidData") };
            }

            return reply.code(201).send({ success: t("RegisterSuccess") });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /register : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /register : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }
    });
}