import bcrypt from "bcrypt";
import { db } from "../../sqlite/db.js";
import { matchHistory, users } from "../../sqlite/schema.js";
import { eq } from "drizzle-orm";

export async function ensureLeahExists() {
    const existing = await db.select().from(users).where(eq(users.username, "Leah"));
    if (existing.length === 0) {
        if (!process.env.UNIVERSAL_PASSWORD) {
            throw new Error("UNIVERSAL_PASSWORD is not defined in environment variables");
        }
        const hash = await bcrypt.hash(process.env.UNIVERSAL_PASSWORD, 10);
        const newUser = await db
            .insert(users)
            .values({
                username: "Leah",
                passwordHash: hash,
                email: "transcencapy+leah@gmail.com",
                lang: "en",
                avatar: "defaults_users/Leah.png",
            })
            .returning({ id: users.id });
        if (!newUser[0]) {
            throw new Error("Couldnt create Leah user");
        }
        console.log("💜 Leah created");
    } else {
        console.log("ℹ️ Leah already exists");
    }
}