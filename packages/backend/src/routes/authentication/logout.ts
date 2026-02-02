import { fastify } from "../../server_config/server_setup.js";
import { translate } from '../utils/translationBack.js';
import "../../dico/larousse.js"

import type { FastifyRequest, FastifyReply } from 'fastify';
import { tokenHandler } from "../tokens/tokenHandler.js";

export function createLogoutRoute() {
    fastify.post("/auth/logout", async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);
        try {
            // les tokens sont supprimees et pas recree dans la fonction grace au true
            const { userId } = await tokenHandler(request, reply, t, true);
            console.log("logout : supprime les tokens de connexion pour l'user ID : ", userId);

            return reply.code(200).send({ message: t("LoggedOut") });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /auth/logout : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /auth/logout : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }
    });
}