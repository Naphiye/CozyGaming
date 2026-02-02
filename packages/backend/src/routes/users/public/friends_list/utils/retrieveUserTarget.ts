import { db } from "../../../../../server_config/sqlite/db.js";
import { users } from "../../../../../server_config/sqlite/schema.js";
import { eq } from "drizzle-orm";
import type { usersType } from "../../all_users.js";


export async function retrieveUserTarget(t: (key: string) => string, userId: number, smallerId: number, greaterId: number, isBLock: boolean, status: string) {
    // trouver les info du mec quon ajoute
    const friend_user = await db.select().from(users).where(eq(users.id, smallerId === userId ? greaterId : smallerId));
    if (!friend_user[0]) {
        throw { code: 404, message: t("userNotFound") };
    }
    let avatar_user = friend_user[0].avatar;
    if (isBLock) {
        avatar_user = "block-avatar.png";
    }
    // reconstruire un userstype de notre nouvel ami et lenvoyer
    const new_userWithType: usersType = {
        id: friend_user[0].id,
        username: friend_user[0].username,
        avatar: avatar_user,
        sendByAuthor: true,
        status: status,
    }
    return new_userWithType;
}
