import bcrypt from "bcrypt";
import { db } from "../../sqlite/db.js";
import { matchHistory, users, usersFriends } from "../../sqlite/schema.js";
import { eq } from "drizzle-orm";

export async function ensureWizardExists() {
    const existing = await db.select().from(users).where(eq(users.username, "Wizard"));
    if (existing.length === 0) {
        if (!process.env.UNIVERSAL_PASSWORD) {
            throw new Error("UNIVERSAL_PASSWORD is not defined in environment variables");
        }
        const hash = await bcrypt.hash(process.env.UNIVERSAL_PASSWORD, 10);
        const newUser = await db
            .insert(users)
            .values({
                username: "Wizard",
                passwordHash: hash,
                email: "transcencapy+wizard@gmail.com",
                lang: "en",
                avatar: "defaults_users/Wizard.png",
            })
            .returning({ id: users.id });
        if (!newUser[0]) {
            throw new Error("Couldnt create Wizard user");
        }
        const adminID = await db.select({ id: users.id }).from(users).where(eq(users.username, "Pouet"));
        if (!adminID[0]) {
            console.error("Couldnt find Pouet user to add for Wizard's friends list");
            return;
        }
        // wizard pending friendship with admin (Pouet)
        const smallerId = Math.min(newUser[0].id, adminID[0].id);
        const greaterId = Math.max(newUser[0].id, adminID[0].id);
        await db.insert(usersFriends).values({
            smallerUserId: smallerId,
            greaterUserId: greaterId,
            actionByUserId: adminID[0].id,
            status: "accepted",
        });
        console.log("💜 Wizard created");
    } else {
        console.log("ℹ️ Wizard already exists");
    }
}