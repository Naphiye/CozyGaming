import type { FastifyRequest, FastifyReply } from "fastify";
import { fastify } from "../../../server_config/server_setup.js";
import { db } from "../../../server_config/sqlite/db.js";
import { users } from "../../../server_config/sqlite/schema.js";
import { eq } from "drizzle-orm";
import { translate } from "../../utils/translationBack.js";
import { tokenHandler } from "../../tokens/tokenHandler.js";
import { checkBeforeUpdateUsername, checkBeforeUpdateMail, checkBeforeUpdatePassword } from "./profile_utils/utils_check.js"

export function createUpdateInfoRoutes() {
    fastify.put("/users/me/update/username", { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);

        try {
            const body = request.body as { inputUsername: string };

            if (!body || !body.inputUsername)
                throw { code: 400, message: t("invalidData") };

            const { userId } = await tokenHandler(request, reply, t, false);

            const validUsername = await checkBeforeUpdateUsername(body.inputUsername,
                userId, t);

            //update db
            await db
                .update(users)
                .set({ username: validUsername })
                .where(eq(users.id, userId))

            //get the user with updated info
            const updatedUser = await db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (!updatedUser)
                throw { code: 500, message: t("putUsernameError") };

            return reply.code(200).send({
                user: {
                    id: updatedUser[0]?.id,
                    username: updatedUser[0]?.username,
                    lang: updatedUser[0]?.lang,
                }
            });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /users/me/update/username : ", error);
            return reply.code(500).send({ error: t("putUsernameError") });
        }
    });



    fastify.put("/users/me/update/email", { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);

        try {
            const body = request.body as { confirmedNewMail: string, newMail: string };

            if (!body || !body.confirmedNewMail || !body.newMail)
                throw { code: 400, message: t("invalidData") };

            const { userId } = await tokenHandler(request, reply, t, false);

            const newMail = await checkBeforeUpdateMail(body, userId, t);

            //update in db
            await db
                .update(users)
                .set({ email: newMail })
                .where(eq(users.id, userId))

            const updatedUser = await db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            return reply.code(200).send({
                message: "✅ Mail change success ✅",
                user: {
                    id: updatedUser[0]?.id,
                    username: updatedUser[0]?.username,
                    lang: updatedUser[0]?.lang,
                }
            })

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /users/me/update/email : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /users/me/update/email : ", error);
            return reply.code(500).send({ error: t("putMailError") });
        }
    });


    fastify.put("/users/me/update/password", { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);

        try {
            const body = request.body as { currentPassword: string; newPassword: string; confirmNewPassword: string };

            if (!body || !body.currentPassword || !body.newPassword || !body.confirmNewPassword)
                throw { code: 400, message: t("invalidData") };

            const { userId } = await tokenHandler(request, reply, t, false);

            const hashedNewPassword = await checkBeforeUpdatePassword(body, userId, t);

            await db
                .update(users)
                .set({ passwordHash: hashedNewPassword })
                .where(eq(users.id, userId))

            const updatedUser = await db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            return reply.code(200).send({
                message: "✅ Password change success ✅",
                user: {
                    id: updatedUser[0]?.id,
                    username: updatedUser[0]?.username,
                    lang: updatedUser[0]?.lang,
                }
            })

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /users/me/update/password : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /users/me/update/password : ", error);
            return reply.code(500).send({ error: t("putPasswordError") });
        }
    });




    const allowedLangs = ["cn", "en", "fr"];

    function isAllowedLang(lang: string): boolean {
        return allowedLangs.includes(lang);
    }

    fastify.put(
        "/users/me/update/lang",
        {
            config: {
                rateLimit: { max: 20, timeWindow: "1 minute" }
            }
        },
        async (request: FastifyRequest, reply: FastifyReply) => {

            const t = translate(request);

            try {
                const body = request.body as { newLang?: string };

                if (!body || !body.newLang)
                    throw { code: 400, message: t("invalidData") };

                if (!isAllowedLang(body.newLang))
                    throw { code: 400, message: t("langNotAllowed") };

                // Auth + user ID
                const { userId } = await tokenHandler(request, reply, t, false);

                // Update DB
                await db
                    .update(users)
                    .set({ lang: body.newLang })
                    .where(eq(users.id, userId));

                return reply.code(200).send({ success: true });

            } catch (error: any) {
                if (typeof error.code === "number") {
                    console.error("Error /users/me/update/lang :", error);
                    return reply.code(error.code).send({ error: error.message });
                }
                console.error("Error /users/me/update/lang :", error);
                return reply.code(500).send({ error: t("putLanguageError") });
            }
        }
    );

}