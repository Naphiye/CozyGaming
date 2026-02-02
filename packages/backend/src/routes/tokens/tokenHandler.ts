import { fastify } from "../../server_config/server_setup.js";
import { and, eq, inArray, desc } from "drizzle-orm";
import { db } from "../../server_config/sqlite/db.js"
import crypto from "node:crypto";
import type { FastifyRequest, FastifyReply } from 'fastify';

import "../../dico/larousse.js"
import { accessTokens } from "../../server_config/sqlite/schema.js";


const MAX_ACCESS_SESSIONS = 2; // nombre de session max active par user 

export async function tokenHandler(request: FastifyRequest, reply: FastifyReply, t: (key: string) => string, isLogout: boolean) {
    try {
        // get access token
        const clientAccessToken = request.cookies?.access ?? null;
        if (!clientAccessToken) {
            throw { code: 401, message: t("unauthorized") };
        }
        const accessDecoded = fastify.jwt.verify(clientAccessToken);
        const clientAccessId = (accessDecoded as { id: number }).id;
        // access token get and check
        const tokenHash = crypto.createHash("sha256").update(clientAccessToken).digest("hex");
        const matchedToken = await db.select().from(accessTokens).where(and(eq(accessTokens.userId, clientAccessId), eq(accessTokens.tokenHash, tokenHash)));
        if (!matchedToken[0]) {
            // delete les access token de luser si on est arrivé jusque la donc ca veut dire on avait un bon jwt mais pas dans la db
            throw { code: 401, message: t("unauthorized") };
        }

        // Date check
        const expiresAtDate = new Date(matchedToken[0].expiresAt);
        if (isNaN(expiresAtDate.getTime())) {
            await deleteAllAccessToken(clientAccessId);
            throw { code: 500, message: t("Invalidtokendateformat") };
        }
        if (expiresAtDate < new Date()) {
            await deleteAllAccessToken(clientAccessId);
            throw { code: 401, message: t("unauthorized") };
        }
        // slice check
        const tokens = await db
            .select()
            .from(accessTokens)
            .where(eq(accessTokens.userId, clientAccessId))
            .orderBy(desc(accessTokens.expiresAt));
        const tokensToDelete = tokens.slice(MAX_ACCESS_SESSIONS); // tout ce qui dépasse 2

        if (tokensToDelete.length > 0) {
            const idsToDelete = tokensToDelete.map(t => t.id);
            await db
                .delete(accessTokens)
                .where(inArray(accessTokens.id, idsToDelete));
        }
        // si on se deconnecte ou autre je supprime le token
        if (isLogout) {
            // delete tokens in reply and db
            deleteToken(reply);
            await db
                .delete(accessTokens)
                .where(eq(accessTokens.id, matchedToken[0].id));
        }

        // return user id
        return { userId: clientAccessId };

    } catch (error: any) {
        // en fait je mets dans un try catch pour pouvoir directement delete les token si besoin en cas louche
        // deleteToken(reply);
        deleteToken(reply);
        if (typeof error.code === "number" && error.message) {
            console.error("Error in tokenHandler : code : ", error.code, ", message : ", error.message);
            throw { code: 498, message: error.message }
        }
        console.error("Error in tokenHandler : ", error);
        // sinon lancer lerror brute pour quelle soit catch
        throw { code: 498, error };
    }
}

async function deleteAllAccessToken(accessUserId: number) {
    await db.delete(accessTokens).where(eq(accessTokens.userId, accessUserId));
}

function deleteToken(reply: FastifyReply) {
    reply.clearCookie("access", {
        path: "/",       // même path que celui utilisé pour créer le cookie
        httpOnly: true,  // pareil que lors du login
        secure: true,    // si tu es en HTTPS-
        sameSite: "lax"  // ou strict, selon ton besoin
    });
}

