import type { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from "bcrypt";
import { fakeHash, fastify } from "../../server_config/server_setup.js";

import { db } from "../../server_config/sqlite/db.js"
import { users, usersTwoFA } from "../../server_config/sqlite/schema.js"
import { and, eq } from "drizzle-orm";

import { translate } from '../utils/translationBack.js';
import "../../dico/larousse.js"
import { sendNewToken } from "../tokens/sendNewToken.js";
import { tokenHandler } from "../tokens/tokenHandler.js";


async function codeChecker(t: (key: string) => string, userId: number, code: string) {
    // recup le code de luser dans la db
    const userFA = await db.select().from(usersTwoFA).where(eq(usersTwoFA.userId, userId));
    if (!userFA[0]) {
        await bcrypt.compare(code, fakeHash);
        throw { code: 401, message: t("InvalidCodeFA") };
    }
    const isValid = await bcrypt.compare(code, userFA[0].twoFACodeHash);
    if (!isValid) {
        throw { code: 401, message: t("InvalidCodeFA") };
    }
    // check la date
    const expiresAtDate = new Date(userFA[0].expiresAt);
    if (isNaN(expiresAtDate.getTime())) {
        throw { code: 500, message: t("Invalidtokendateformat") };
    }
    if (expiresAtDate < new Date()) {
        // delete le code si perimé
        await db.delete(usersTwoFA).where(eq(usersTwoFA.userId, userId));
        throw { code: 401, message: t("unauthorized") };
    }
    await db.delete(usersTwoFA).where(and(eq(usersTwoFA.userId, userId), eq(usersTwoFA.twoFACodeHash, userFA[0].twoFACodeHash)));

}

export function createCheckcode2faRoute() {
    // check code lors du login ou activation/desactivation
    fastify.post('/users/me/2fa/checkcode', { config: { rateLimit: { max: 15, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);
        try {
            const body = request.body as { userId: number; code: string, isEnabled: boolean };
            if (!body || !body.code || body.userId === undefined || body.isEnabled === undefined) {
                throw { code: 400, message: t("invalidData") };
            }
            let verifyUserId = body.userId;
            // si userId <= 0 alors on recupere via les tokens car on est co
            if (body.userId <= 0) {
                const { userId } = await tokenHandler(request, reply, t, false);
                verifyUserId = userId;
            }

            await codeChecker(t, verifyUserId, body.code);
            // delete le code si on a reussi

            if (body.userId <= 0) {
                // ne pas envoyer les tokens car on est co donc des.activation reussie
                if (body.isEnabled) {
                    // update dans la db a true si on active
                    await db.update(users).set({ twoFA: true }).where(eq(users.id, verifyUserId));
                    console.log("✅ 2FA check code : active le 2FA pour l'user ID : ", verifyUserId);
                }
                else {
                    await db.update(users).set({ twoFA: false }).where(eq(users.id, verifyUserId));
                    console.log("✅ 2FA check code : desactive le 2FA pour l'user ID : ", verifyUserId);
                }
            }
            else { // sinon on est pas co donc on envoie les tokens
                await sendNewToken(reply, verifyUserId);
                console.log("✅ 2FA check code : envoie les tokens de connexion pour l'user ID : ", verifyUserId);
            }

            return reply.code(200).send({ success: t("checkerFACodeSuccess") });
        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error 2FA/checkCode : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }
    });
}