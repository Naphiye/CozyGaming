import { fastify } from "../../../server_config/server_setup.js";
import { db } from "../../../server_config/sqlite/db.js";
import { users } from "../../../server_config/sqlite/schema.js";
import { eq } from "drizzle-orm";
import fspromise from "fs/promises";
import path from "path";
import type { FastifyRequest, FastifyReply } from "fastify";
import { translate } from "../../utils/translationBack.js";
import { tokenHandler } from "../../tokens/tokenHandler.js";
import { uploadNewAvatar } from "./profile_utils/avatar_check.js";
import { uploadsPath } from "../../../server_config/server_setup.js";
import { fileTypeFromBuffer } from "file-type";

const API_PATH = "/api/uploads/"

export function createAvatarRoutes() {
    fastify.put("/users/me/update/avatar", { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);

        try {
            const { userId } = await tokenHandler(request, reply, t, false);
            //verifier le type de fichier ici accepter que png jpeg jpg webp et bmp 
            const dataFile = await request.file(); //read the file that the user sent

            if (!dataFile)
                throw { code: 400, message: t("noAvatarUploaded") };

            const chunks = [];

            for await (const chunk of dataFile.file)
                chunks.push(chunk);

            const buffer = Buffer.concat(chunks);

            const realType = await fileTypeFromBuffer(buffer);
            const allowedExtensions = ["png", "jpg", "jpeg", "webp", "bmp"];

            if (!realType || !allowedExtensions.includes(realType.ext))
                throw { code: 400, message: t("invalidAvatarType") };


            const avatarName = await uploadNewAvatar(buffer, userId, realType.ext, t);
            const avatarPath = path.join(API_PATH, avatarName);

            return reply.code(200).send({ avatarPath: avatarPath, });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /users/me/update/avatar : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /users/me/update/avatar : ", error);
            return reply.code(500).send({ error: t("putAvatarError") });
        }
    });

    fastify.delete("/users/me/delete/avatar", { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);

        try {
            const { userId } = await tokenHandler(request, reply, t, false);

            const db_avatar = await db
                .select({
                    id: users.id,
                    avatar: users.avatar,
                })
                .from(users)
                .where(eq(users.id, userId)).limit(1);

            const user = db_avatar?.[0];
            if (!user)
                throw { code: 401, message: t("unauthorized") };

            if (user.avatar === "default-avatar.png") {
                throw { code: 409, message: t("NoAvatarToDelete") };
            }
            if (!user.avatar.includes("defaults_users/")) {
                const avatarPath = path.join(uploadsPath, user.avatar); //find the avatar path
                try {
                    await fspromise.unlink(avatarPath); //delete the file
                } catch (err) {
                    console.error("Delete avatar path: ", err);
                    throw { code: 500, message: t("deleteAvatarPathFail") };
                }
            }
            await db
                .update(users)
                .set({ avatar: "default-avatar.png" })
                .where(eq(users.id, userId));

            return reply.code(200).send({ success: t("deleteAvatarSuccess") });

        } catch (error: any) {
            if (typeof error.code === "number" && error.message) {
                console.error("Error /users/me/delete/avatar : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /users/me/delete/avatar : ", error);
            return reply.code(500).send({ error: t("deleteAvatarFail") });
        }
    });
}
