import bcrypt from "bcrypt";
import { db } from "../../sqlite/db.js";
import { matchHistory, users } from "../../sqlite/schema.js";
import { eq } from "drizzle-orm";

export async function ensureMarnieExists() {
    const existing = await db.select().from(users).where(eq(users.username, "Marnie"));
    if (existing.length === 0) {
        if (!process.env.UNIVERSAL_PASSWORD) {
            throw new Error("UNIVERSAL_PASSWORD is not defined in environment variables");
        }
        const hash = await bcrypt.hash(process.env.UNIVERSAL_PASSWORD, 10);
        const newUser = await db
            .insert(users)
            .values({
                username: "Marnie",
                passwordHash: hash,
                email: "transcencapy+marnie@gmail.com",
                lang: "en",
                avatar: "defaults_users/Marnie.png",
            })
            .returning({ id: users.id });
        if (!newUser[0]) {
            throw new Error("Couldnt create Marnie user");
        }
        console.log("💜 Marnie created");
    } else {
        console.log("ℹ️ Marnie already exists");
    }
}