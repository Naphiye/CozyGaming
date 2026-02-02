import bcrypt from "bcrypt";
import { db } from "../../sqlite/db.js";
import { matchHistory, users } from "../../sqlite/schema.js";
import { eq } from "drizzle-orm";


// player : userId, Moulinette, Pouet, Willy
export async function ensureAdminExists() {
    const existing = await db.select().from(users).where(eq(users.username, "Pouet"));
    if (existing.length === 0) {
        if (!process.env.UNIVERSAL_PASSWORD) {
            throw new Error("UNIVERSAL_PASSWORD is not defined in environment variables");
        }
        const hash = await bcrypt.hash(process.env.UNIVERSAL_PASSWORD, 10);
        const newUser = await db
            .insert(users)
            .values({
                username: "Pouet",
                passwordHash: hash,
                email: "transcencapy+pouet@gmail.com",
                lang: "fr",
            })
            .returning({ id: users.id });
        if (!newUser[0]) {
            throw new Error("Couldnt create Pouet user");
        }
        const userId = newUser[0].id;
        const matches = [
            {
                userId,
                mode: "ai",
                playerLeft: "Supergigamegalong",
                scoreLeft: 7,
                playerRight: "AI",
                scoreRight: 11,
                userplace: "left",
                date: 1762042290,
            },
            {
                userId,
                mode: "ai",
                playerLeft: "Proutiprout",
                scoreLeft: 11,
                playerRight: "AI",
                scoreRight: 5,
                userplace: "left",
                date: 1762042165,
            },
            {
                userId,
                mode: "ai",
                playerLeft: "Proutiprout",
                scoreLeft: 5,
                playerRight: "AI",
                scoreRight: 11,
                userplace: "left",
                date: 1762042079,
            },
            {
                userId,
                mode: "classic",
                playerLeft: "Proutiprout",
                scoreLeft: 11,
                playerRight: "Pouetpouetpouet",
                scoreRight: 13,
                userplace: "left",
                date: 1762042165,
            },
            {
                userId,
                mode: "classic",
                playerLeft: "Proutiprout",
                scoreLeft: 13,
                playerRight: "Moulinette",
                scoreRight: 11,
                userplace: "left",
                date: 1762042216,
            },
            {
                userId,
                mode: "classic",
                playerLeft: "Proutiprout",
                scoreLeft: 11,
                playerRight: "Pseudogigamegalong",
                scoreRight: 5,
                userplace: "left",
                date: 1762042200,
            },
            {
                userId,
                mode: "tournament",
                playerLeft: "Moulinette",
                scoreLeft: 11,
                playerRight: "Tahcestlongcepseudo",
                scoreRight: 4,
                userplace: "right",
                date: 1762042322,
            },
            {
                userId,
                mode: "tournament",
                playerLeft: "Pouetpouetpouet",
                scoreLeft: 11,
                playerRight: "Pseudogigamegalong",
                scoreRight: 9,
                userplace: "none",
                date: 1762042322,
            },
            {
                userId,
                mode: "tournament",
                playerLeft: "Moulinette",
                scoreLeft: 4,
                playerRight: "Pouetpouetpouet",
                scoreRight: 11,
                userplace: "none",
                date: 1762042322,
            },
            {
                userId,
                mode: "tournament",
                playerLeft: "Moulinette",
                scoreLeft: 9,
                playerRight: "q",
                scoreRight: 11,
                userplace: "right",
                date: 1762042064,
            },
            {
                userId,
                mode: "tournament",
                playerLeft: "Pouetpouetpouet",
                scoreLeft: 4,
                playerRight: "Pseudogigamegalong",
                scoreRight: 11,
                userplace: "none",
                date: 1762042064,
            },
            {
                userId,
                mode: "tournament",
                playerLeft: "q",
                scoreLeft: 11,
                playerRight: "Pseudogigamegalong",
                scoreRight: 6,
                userplace: "left",
                date: 1762042064,
            },
        ];
        // 3️⃣ Insertion dans la table
        await db.insert(matchHistory).values(matches);
        console.log("✅ Admin user created (username: Pouet, password: UNIVERSAL_PASSWORD env variable)");
    } else {
        console.log("ℹ️ Admin user already exists");
    }
}


