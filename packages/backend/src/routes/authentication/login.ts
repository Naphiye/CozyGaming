import { fakeHash, fastify } from "../../server_config/server_setup.js";
import { translate } from '../utils/translationBack.js';
import "../../dico/larousse.js"

import type { FastifyRequest, FastifyReply } from 'fastify';
import { db } from "../../server_config/sqlite/db.js"
import { users } from "../../server_config/sqlite/schema.js"
import { eq } from "drizzle-orm";

import bcrypt from "bcrypt";
import { sendNewToken } from "../tokens/sendNewToken.js";

import { sendEmailFACode } from "../2fa/sendEmail2FA.js";
import { createRandomTokenTwoFA } from "../2fa/verifyToken2FA.js";
import { makeMailSchema } from "./utilsSchema.js";

export function isEmail(t: (key: string) => string, value: string): boolean {
    const schema = makeMailSchema(t);
    const emailValidation = schema.safeParse(value);
    return emailValidation.success;
}

export function createLoginRoute() {
    fastify.post('/auth/login', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);
        try {
            const body = request.body as { username: string; password: string };

            if (!body || !body.username || !body.password) {
                throw { code: 400, message: t("invalidData") };
            }

            const isEmailLogin = isEmail(t, body.username);
            const existingUser = await db
                .select()
                .from(users)
                .where(
                    isEmailLogin
                        ? eq(users.email, body.username)
                        : eq(users.username, body.username)
                );
            const user = existingUser[0];
            if (!user || user.isOAuth) {
                await bcrypt.compare(body.password, fakeHash)
                throw { code: 401, message: t("connexionFailed") };
            }
            const isValid = await bcrypt.compare(body.password, user.passwordHash);
            if (!isValid) {
                throw { code: 401, message: t("connexionFailed") };
            }
            if (user.twoFA) {
                const { token } = await createRandomTokenTwoFA(user.id);
                await sendEmailFACode(t, user, true);
                console.log("✅ Login 2FA : envoie le token 2FA et email 2FA pour l'user ID : ", user.id);
                const url = process.env.LOCALHOST + `?token=${token}`;
                return reply.code(200).send({ user: { twoFA: user.twoFA, url: url } });
            }
            else {
                await sendNewToken(reply, user.id);
                console.log("✅ login sans 2FA : envoie les tokens de connexion pour l'user ID : ", user.id);
            }

            return reply.code(200).send({ user: { id: user.id, lang: user.lang, twoFA: user.twoFA } });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /auth/login : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /auth/login : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }

    });

    fastify.post('/auth/login/resend', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);
        try {
            const body = request.body as { username: string };
            if (!body || body.username === undefined) {
                throw { code: 400, message: t("invalidData") };
            }

            const user = await db.select().from(users).where(eq(users.username, body.username));
            if (!user[0] || !user[0].twoFA) {
                throw { code: 401, message: t("unauthorized") };
            }

            await sendEmailFACode(t, user[0], true);

            return reply.code(200).send({ success: t("FASendMailsuccess") });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /auth/login/resend : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /auth/login/resend : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }
    });
}