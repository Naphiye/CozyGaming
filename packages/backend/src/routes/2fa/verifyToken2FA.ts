import { fastify } from "../../server_config/server_setup.js";
import { translate } from '../utils/translationBack.js';
import "../../dico/larousse.js"

import type { FastifyRequest, FastifyReply } from 'fastify';
import { db } from "../../server_config/sqlite/db.js"
import { twoFAToken, users } from "../../server_config/sqlite/schema.js"
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export async function createRandomTokenTwoFA(userId: number) {
    const expiresTokenTime = 60 * 5; // 5min de validité pour le token renvoyé grace a github 
    // supprimer le token si il existe
    await db.delete(twoFAToken).where(eq(twoFAToken.userId, userId));
    // creer un token random qui ne contient rien quon va utiliser pour la redirection et sauthentifier
    const token = crypto.randomUUID();
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    // ajouter le token dans la db avec le user id avec une expiration de 5min
    const expiresToken = new Date(Date.now() + expiresTokenTime * 1000);
    const result = await db.insert(twoFAToken).values({
        userId: userId,
        randomTokenHash: hash,
        expiresAt: expiresToken.toISOString()
    }).returning();
    if (!result[0]) {
        console.error("❌ Échec de l'insertion du token 2FA dans la db pour : ", userId);
        throw { code: 400, message: "insertion du token 2FA dans la db failed" };
    }
    return { token };
}

export function createVerifyToken2faRoute() {
    fastify.post('/auth/2fa/verifytoken', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);
        try {
            const body = request.body as { token: string };
            if (!body || !body.token || body.token === undefined) {
                throw { code: 400, message: t("invalidData") };
            }
            // je hash le token recu pour comparer ce hashage avec celui dans ma db
            const hash = crypto.createHash("sha256").update(body.token).digest("hex");
            const tokenInDb = await db.select().from(twoFAToken).where(eq(twoFAToken.randomTokenHash, hash));
            if (!tokenInDb[0]) {
                throw { code: 401, message: t("unauthorized") };
            }
            // Date check
            const expiresAtDate = new Date(tokenInDb[0].expiresAt);
            if (isNaN(expiresAtDate.getTime())) {
                throw { code: 500, message: t("Invalidtokendateformat") };
            }
            if (expiresAtDate < new Date()) {
                throw { code: 401, message: t("unauthorized") };
            }
            // supprimer le token
            await db.delete(twoFAToken).where(eq(twoFAToken.randomTokenHash, hash));
            // donc la jai mon token qui est bon je peux get le user id et lang
            const user = await db.select({ id: users.id, username: users.username, lang: users.lang }).from(users).where(eq(users.id, tokenInDb[0].userId));
            if (!user[0]) {
                console.error("❌ Utilisateur introuvable pour le token 2FA : ", body.token);
                throw { code: 401, message: t("unauthorized") };
            }

            console.log("✅ 2FA : token 2FA vérifié avec succès pour l'user ID : ", user[0].id);
            return reply.code(200).send({ user: { id: user[0].id, username: user[0].username, lang: user[0].lang } });
        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /auth/2fa/verifytoken : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /auth/2fa/verifytoken : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }
    });
}