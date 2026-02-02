import bcrypt from "bcrypt";
import { db } from "../../sqlite/db.js";
import { matchHistory, users } from "../../sqlite/schema.js";
import { eq } from "drizzle-orm";

export async function ensureLewisExists() {
    const existing = await db.select().from(users).where(eq(users.username, "Lewis"));
    if (existing.length === 0) {
        if (!process.env.UNIVERSAL_PASSWORD) {
            throw new Error("UNIVERSAL_PASSWORD is not defined in environment variables");
        }
        const hash = await bcrypt.hash(process.env.UNIVERSAL_PASSWORD, 10);
        const newUser = await db
            .insert(users)
            .values({
                username: "Lewis",
                passwordHash: hash,
                email: "transcencapy+lewis@gmail.com",
                lang: "en",
                avatar: "defaults_users/Lewis.png",
            })
            .returning({ id: users.id });
        if (!newUser[0]) {
            throw new Error("Couldnt create Lewis user");
        }
        console.log("💜 Lewis created");
    } else {
        console.log("ℹ️ Lewis already exists");
    }
}