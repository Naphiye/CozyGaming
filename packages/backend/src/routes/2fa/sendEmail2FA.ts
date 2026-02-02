// import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import crypto from "node:crypto"; // pour generer le code 2FA

import { db } from "../../server_config/sqlite/db.js"
import { users, usersTwoFA } from "../../server_config/sqlite/schema.js"
import { eq } from "drizzle-orm";
import { emailSender } from "../../server_config/server_setup.js";

const codeTime = 60 * 5; // 5min 

async function generate2FACode(userId: number) {
    // supprime le code lié a luser si il en existe deja un
    await db.delete(usersTwoFA).where(eq(usersTwoFA.userId, userId));

    // creer le code
    const code = crypto.randomBytes(512).toString('hex').slice(0, 6).toUpperCase();
    // et un expired at
    const expiresAtCode = new Date(Date.now() + codeTime * 1000);
    const hashedCode = await bcrypt.hash(code, 10);
    // ajouter le code dans la db a luser
    await db.insert(usersTwoFA).values({
        userId: userId,
        twoFACodeHash: hashedCode,
        expiresAt: expiresAtCode.toISOString(),
    });
    // renvoyer le code
    return code;
}

type userRow = typeof users.$inferSelect;

export async function sendEmail(
    user: userRow,
    subject: string,
    html: string
) {
    await emailSender.sendMail({
        from: '"CapySupport 🦫" <transcencapy@gmail.com>',
        to: user.email || "transcencapy@gmail.com",
        subject,
        html,
    });

}

export async function sendEmailFACode(t: (key: string) => string, user: userRow, isLogin: boolean, isActivate?: boolean | false) {
    try {
        const code = await generate2FACode(user.id);
        let emailType: string = "";
        if (isLogin) {
            await sendEmail(user, t("emailLoginFASubject"),
                `<p>${t("hello")} ${user.username},</p>
             <p>${t("emailLoginFAMessage")} ${code}</p>`);
            emailType = "login 2FA";
        } else {
            if (isActivate) {
                await sendEmail(user, t("emailActivateFASubject"),
                    `<p>${t("hello")} ${user.username},</p>
                 <p>${t("emailActivateFAMessage")} ${code}</p>`);
                emailType = "activate 2FA";
            }
            else {
                await sendEmail(user, t("emailDeactivateFASubject"),
                    `<p>${t("hello")} ${user.username},</p>
             <p>${t("emailDeactivateFAMessage")} ${code}</p>`);
                emailType = "deactivate 2FA";
            }
        }

        console.log("✅ Email envoyé : ", emailType, " : ", code);
    } catch (error: any) {
        console.error("error sending email : ", error);
        throw { code: 500, message: t("emailSendError") };
    }
}

