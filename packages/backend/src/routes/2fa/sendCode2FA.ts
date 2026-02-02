import { fastify } from "../../server_config/server_setup.js";
import type { FastifyRequest, FastifyReply } from 'fastify';
import { db } from "../../server_config/sqlite/db.js"
import { users } from "../../server_config/sqlite/schema.js"
import { eq } from "drizzle-orm";
import { translate } from '../utils/translationBack.js';

import { tokenHandler } from "../tokens/tokenHandler.js";
import { sendEmailFACode } from "./sendEmail2FA.js"

export function createSendcode2faRoute() {
    // envoie dun code, enabled defini si on veut lactiver ou le desactiver
    fastify.post('/users/me/2fa/sendcode', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        // Récupérer la langue envoyée par le front et le mettre dans un t, comme ca cest utilisable comme au front
        const t = translate(request);
        try {
            const body = request.body as { enabled: boolean };
            if (!body || body.enabled === undefined) {
                throw { code: 400, message: t("invalidData") };
            }
            const { userId } = await tokenHandler(request, reply, t, false);

            const user = await db.select().from(users).where(eq(users.id, userId));
            if (!user[0]) {
                throw { code: 401, message: t("unauthorized") };
            }

            // check si on a deja  des.activé et quon demande la meme chose
            if ((body.enabled && user[0].twoFA)
                || (!body.enabled && !user[0].twoFA)) {
                throw { code: 409, message: t("conflitTwoFAStatus") };

            }

            await sendEmailFACode(t, user[0], false, body.enabled);

            return reply.code(201).send({ success: t("FASendMailsuccess") });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error 2FA/sendCode : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }
    });
}


