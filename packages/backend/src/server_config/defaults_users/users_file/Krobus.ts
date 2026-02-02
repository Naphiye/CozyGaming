import bcrypt from "bcrypt";
import { db } from "../../sqlite/db.js";
import { matchHistory, users, usersFriends } from "../../sqlite/schema.js";
import { eq } from "drizzle-orm";

export async function ensureKrobusExists() {
    const existing = await db.select().from(users).where(eq(users.username, "Krobus"));
    if (existing.length === 0) {
        if (!process.env.UNIVERSAL_PASSWORD) {
            throw new Error("UNIVERSAL_PASSWORD is not defined in environment variables");
        }
        const hash = await bcrypt.hash(process.env.UNIVERSAL_PASSWORD, 10);
        const newUser = await db
            .insert(users)
            .values({
                username: "Krobus",
                passwordHash: hash,
                email: "transcencapy+krobus@gmail.com",
                lang: "en",
                avatar: "defaults_users/Krobus.png",
            })
            .returning({ id: users.id });
        if (!newUser[0]) {
            throw new Error("Couldnt create Krobus user");
        }
        const adminID = await db.select({ id: users.id }).from(users).where(eq(users.username, "Pouet"));
        if (!adminID[0]) {
            console.error("Couldnt find Pouet user to add for Krobus's friends list");
            return;
        }
        // krobus pending friendship with admin (Pouet)
        const smallerId = Math.min(newUser[0].id, adminID[0].id);
        const greaterId = Math.max(newUser[0].id, adminID[0].id);
        await db.insert(usersFriends).values({
            smallerUserId: smallerId,
            greaterUserId: greaterId,
            actionByUserId: adminID[0].id,
            status: "accepted",
        });
        console.log("💜 Krobus created");
    } else {
        console.log("ℹ️ Krobus already exists");
    }
}