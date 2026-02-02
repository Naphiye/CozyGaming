import bcrypt from "bcrypt";
import { db } from "../../sqlite/db.js";
import { matchHistory, users, usersFriends } from "../../sqlite/schema.js";
import { eq } from "drizzle-orm";


export async function ensureAbigailExists() {
    const existing = await db.select().from(users).where(eq(users.username, "Abigail"));
    if (existing.length === 0) {
        if (!process.env.UNIVERSAL_PASSWORD) {
            throw new Error("UNIVERSAL_PASSWORD is not defined in environment variables");
        }
        const hash = await bcrypt.hash(process.env.UNIVERSAL_PASSWORD, 10);
        const newUser = await db
            .insert(users)
            .values({
                username: "Abigail",
                passwordHash: hash,
                email: "transcencapy+abigail@gmail.com",
                lang: "en",
                avatar: "defaults_users/Abigail.png",
            })
            .returning({ id: users.id });
        if (!newUser[0]) {
            throw new Error("Couldnt create Abigail user");
        }
        const adminID = await db.select({id: users.id}).from(users).where(eq(users.username, "Pouet"));
        if(!adminID[0]){
            console.error("Couldnt find Pouet user to add for Abigail's friends list");
            return;
        }
        // abigail pending friendship with admin (Pouet)
        const smallerId = Math.min(newUser[0].id, adminID[0].id);
        const greaterId = Math.max(newUser[0].id, adminID[0].id);
        await db.insert(usersFriends).values({
            smallerUserId: smallerId,
            greaterUserId: greaterId,
            actionByUserId: adminID[0].id,
            status: "pending",
        });

        console.log("💜 Abigail created");
    } else {
        console.log("ℹ️ Abigail already exists");
    }
}