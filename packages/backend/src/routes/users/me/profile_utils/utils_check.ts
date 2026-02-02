import bcrypt from "bcrypt";
import { translate } from "../../../utils/translationBack.js";
import { db } from "../../../../server_config/sqlite/db.js";
import { users } from "../../../../server_config/sqlite/schema.js";
import { eq } from "drizzle-orm";

type UpdatePassword = {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
};

type UpdateMail = {
    confirmedNewMail: string;
    newMail: string;
}

export async function checkBeforeUpdateLang(newLang: string,
    userId: number, t: ReturnType<typeof translate>) {
    //fetch the current email in db
    const db_lang = await db
        .select({
            id: users.id,
            lang: users.lang,
        })
        .from(users)
        .where(eq(users.id, userId));

    const user = db_lang?.[0];
    if (!user)
        throw { code: 401, message: t("unauthorized") };

    if (user.lang === newLang)
        throw { code: 400, message: t("sameLanguageError") };
    return newLang;
}

export async function checkBeforeUpdateMail(body: UpdateMail,
    userId: number, t: ReturnType<typeof translate>) {

    //fetch the current email in db
    const db_mail = await db
        .select({
            id: users.id,
            email: users.email,
            lang: users.lang,
            isOAuth: users.isOAuth
        })
        .from(users)
        .where(eq(users.id, userId));

    const user = db_mail?.[0];
    if (!user || user.isOAuth)
        throw { code: 401, message: t("unauthorized") };


    //check that it's not the same email
    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, body.newMail));

    const [foundUser] = existingUser;
    if (foundUser) {
        if (foundUser.id !== userId)
            throw { code: 409, message: t("emailAlreadyExist") };
        else
            throw { code: 400, message: t("sameMail") };
    }
    return body.newMail;
}

export async function checkBeforeUpdatePassword(body: UpdatePassword,
    userId: number, t: ReturnType<typeof translate>) {

    //fetch the current hashed password in db
    const db_password = await db
        .select({
            id: users.id,
            passwordHash: users.passwordHash,
            lang: users.lang,
            isOAuth: users.isOAuth
        })
        .from(users)
        .where(eq(users.id, userId));

    const user = db_password?.[0];
    if (!user || user.isOAuth)
        throw { code: 401, message: t("unauthorized") };

    //check if input password is correct
    const isPasswordValid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
        throw { code: 400, message: t("oldPasswordDontMatch") };
    }


    //check if new password is the same as old password
    const isSamePassword = await bcrypt.compare(body.newPassword, user.passwordHash);
    if (isSamePassword) {
        throw { code: 400, message: t("samePassword") };
    }

    //hash new password
    const hashedNewPassword = await bcrypt.hash(body.newPassword, 10);
    if (!hashedNewPassword)
        throw { code: 500, message: t("hashingFailed") };

    return hashedNewPassword;
}

export async function checkBeforeUpdateUsername(
    inputUsername: string, userId: number,
    t: ReturnType<typeof translate>) {
    
    const isMyself = await db.select()
        .from(users)
        .where(eq(users.id, userId));
    if (!isMyself[0]){
        throw { code: 401, message: t("unauthorized") };
    }
    
    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, inputUsername));
    if (existingUser.length > 0)
        throw { code: 409, message: t("usernameAlreadyExist") };

   
    return inputUsername;
}
