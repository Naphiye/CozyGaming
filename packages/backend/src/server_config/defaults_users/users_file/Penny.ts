import bcrypt from "bcrypt";
import { db } from "../../sqlite/db.js";
import { matchHistory, users } from "../../sqlite/schema.js";
import { eq } from "drizzle-orm";

export async function ensurePennyExists() {
    const existing = await db.select().from(users).where(eq(users.username, "Penny"));
    if (existing.length === 0) {
        if (!process.env.UNIVERSAL_PASSWORD) {
            throw new Error("UNIVERSAL_PASSWORD is not defined in environment variables");
        }
        const hash = await bcrypt.hash(process.env.UNIVERSAL_PASSWORD, 10);
        const newUser = await db
            .insert(users)
            .values({
                username: "Penny",
                passwordHash: hash,
                email: "transcencapy+penny@gmail.com",
                lang: "en",
                avatar: "defaults_users/Penny.png",
            })
            .returning({ id: users.id });
        if (!newUser[0]) {
            throw new Error("Couldnt create Penny user");
        }
        console.log("💜 Penny created");
    } else {
        console.log("ℹ️ Penny already exists");
    }
}