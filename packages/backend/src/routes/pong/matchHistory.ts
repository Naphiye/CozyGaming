import { fastify } from "../../server_config/server_setup.js";
import { translate } from "../utils/translationBack.js";
import { eq, desc, and } from "drizzle-orm";
import type { FastifyRequest, FastifyReply } from 'fastify';
import { db } from "../../server_config/sqlite/db.js"
import { matchHistory, users } from "../../server_config/sqlite/schema.js"
import { tokenHandler } from "../tokens/tokenHandler.js";

export function createMatchHistoryRoutes() {
    fastify.post('/pong/matchhistory', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request); // traductions côté back
        try {

            const { userId } = await tokenHandler(request, reply, t, false);

            const body = request.body as {
                mode: "classic" | "ai" | "tournament";
                playerLeft: string;
                scoreLeft: number;
                playerRight: string;
                scoreRight: number;
                userplace: string;
                date: number;
            };

            const { mode, playerLeft, scoreLeft, playerRight, scoreRight, userplace, date } = body;

            // Insertion dans la DB
            const result = await db.insert(matchHistory).values({
                userId,
                mode,
                playerLeft,
                scoreLeft,
                playerRight,
                scoreRight,
                userplace,
                date,
            }).returning();

            if (result.length === 0) {
                throw { code: 500, message: t("InsertionFailed") };
            }

            return reply.code(201).send({ matchId: result[0]?.id });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /pong/matchhistory : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /pong/matchhistory : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }
    });


    fastify.get('/pong/matchhistory/:username', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request); // pour les traductions côté back
        try {

            await tokenHandler(request, reply, t, false);
            const username = (request.params as { username: string }).username;

            // Validation
            if (!username) {
                throw { code: 400, message: t("invalidusername") };
            }

            // recuperer le userid a partir du username
            const userIdByName = await db.select().from(users).where(eq(users.username, username)).limit(1);
            if (userIdByName.length === 0 || !userIdByName[0]) {
                throw { code: 401, message: t("userNotFound") };
            }

            // Sélection dans la base de données
            const results = await db
                .select()
                .from(matchHistory)
                .where(eq(matchHistory.userId, userIdByName[0].id))
                .orderBy(desc(matchHistory.date));

            // Si aucun match trouvé
            if (!results || results.length === 0) {
                return reply.code(200).send({ matches: [] });
            }

            // Retour JSON
            return reply.code(200).send({
                username,
                matches: results.map(match => ({
                    id: match.id,
                    mode: match.mode,
                    playerLeft: match.playerLeft,
                    scoreLeft: match.scoreLeft,
                    playerRight: match.playerRight,
                    scoreRight: match.scoreRight,
                    userplace: match.userplace,
                    date: match.date,
                })),
            });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /pong/matchhistory/:username : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /pong/matchhistory/:username : ", error);
            return reply.code(500).send({ error: t("serverError") });
        }
    });

    fastify.get('/pong/matchhistory/checkTournamentMatch/:username/:date',
        { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const t = translate(request);

            try {
                await tokenHandler(request, reply, t, false);

                const { username, date } = request.params as { username: string; date: string; };
                const timestamp = Number(date);

                if (!username || isNaN(timestamp)) {
                    throw { code: 400, message: t("invalidData") };
                }

                const user = await db
                    .select()
                    .from(users)
                    .where(eq(users.username, username))
                    .limit(1);

                if (user.length === 0 || !user[0]) {
                    throw { code: 404, message: t("userNotFound") };
                }

                const userId = user[0].id;

                const result = await db
                    .select()
                    .from(matchHistory)
                    .where(
                        and(
                            eq(matchHistory.userId, userId),
                            eq(matchHistory.date, timestamp)
                        )
                    )
                    .limit(1);

                return reply.code(200).send(result.length > 0);
            }
            catch (error: any) {
                if (typeof error.code === "number" && error.message) {
                    console.error("Error /pong/matchhistory/checkTournamentMatch/:username/:date : code : ", error.code, ", message : ", error.message);
                    return reply.code(error.code).send({ error: error.message });
                }
                console.error("Error /pong/matchhistory/checkTournamentMatch/:username/:date : ", error);
                return reply.code(500).send({ error: t("serverError") });
            }
        }
    );
}