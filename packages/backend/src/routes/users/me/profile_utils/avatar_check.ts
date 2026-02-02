import fs from "fs";
import fspromise from "fs/promises";
import path from "path";
import { translate } from "../../../utils/translationBack.js";
import { db } from "../../../../server_config/sqlite/db.js";
import { users } from "../../../../server_config/sqlite/schema.js";
import { eq } from "drizzle-orm";
import { uploadsPath } from "../../../../server_config/server_setup.js";

async function checkBeforeUploadAvatar(userId: number, t: ReturnType<typeof translate>) {
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

    if (user.avatar === "default-avatar.png" || user.avatar.includes("defaults_users/")) {
        return;
    }
    const avatarPath = path.join(uploadsPath, user.avatar); //find the avatar path
    try {
        await fspromise.unlink(avatarPath); //delete the file
    } catch (err) {
        console.error("Delete avatar path: ", err);
        throw { code: 500, message: t("deleteAvatarPathFail") };
    }
}

export async function uploadNewAvatar(
  buffer: Buffer,
  userId: number,
  ext: string, // extension réelle détectée par file-type
  t: ReturnType<typeof translate>
) {
	const db_lang = await db
		.select({
		id: users.id,
		lang: users.lang,
		avatar: users.avatar,
		})
		.from(users)
		.where(eq(users.id, userId));

	const user = db_lang?.[0];
	if (!user) throw { code: 401, message: t("unauthorized") };

	await checkBeforeUploadAvatar(user.id, t);

	const newAvatarFilename = `users/${userId}-avatar.${ext}`;
	const newAvatarPath = path.join(uploadsPath, newAvatarFilename);

	// écrire le buffer dans le fichier
	await fs.promises.writeFile(newAvatarPath, buffer);

	await db
		.update(users)
		.set({ avatar: newAvatarFilename })
		.where(eq(users.id, userId));

	return newAvatarFilename;
}
