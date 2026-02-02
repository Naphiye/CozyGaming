import { auth } from "../../../authentication/auth.ts";
import { dico } from "../../../dico/larousse.ts";
import { navigate } from "../../../router.ts";
import { makeUsernameSchema } from "../../utils/utilsSchema.ts";

async function fetchUniqueUser(alias: string) {
    const lang = dico.getLanguage();
    const res = await fetch("/api/pong/aliasvalidation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": lang,
        },
        body: JSON.stringify({ alias }),
    });

    if (!res.ok) {
        const data = await res.json();
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }
        throw new Error(data.error || dico.tRaw("unknownError"));
    }

    return res.json(); // { valid: true }
}

export async function aliasValidation(alias: string): Promise<string> {
    // Vérifications locales
    if (!alias.trim()) return dico.tRaw("EnterLoginAlert");

    // Vérification DB
    try {
        await fetchUniqueUser(alias); // lance une exception si non unique
        return ""; // tout est ok
    } catch (err: any) {
        return err.message; // message renvoyé par le back
    }
}

export async function tournoiValidation(players: string[]): Promise<{
    success: boolean;
    errors: string[];
}> {
    const tournamentPlayers = players.slice(1); // ignore le joueur connecté
    const errors: string[] = ["", "", ""]; // 3 slots pour les joueurs du tournoi

    // 1️⃣ Vérifie chaque alias individuellement (vide, trop long, existant en DB)
    for (let i = 0; i < tournamentPlayers.length; i++) {
        const alias = tournamentPlayers[i];
        const schema = makeUsernameSchema();
        const parseResult = schema.safeParse(alias);
        if (!parseResult.success) {
           errors[i] = parseResult.error.issues[0].message;
              continue;
        }
        const errorMsg = await aliasValidation(alias);
        if (errorMsg) {
            errors[i] = errorMsg;
        }
    }

    // 2️⃣ Vérifie que tous les pseudos du tournoi sont uniques
    for (let i = 0; i < tournamentPlayers.length; i++) {
        if (!tournamentPlayers[i]) continue; // ignore les champs vides déjà gérés
        for (let j = i + 1; j < tournamentPlayers.length; j++) {
            if (!tournamentPlayers[j]) continue;
            if (tournamentPlayers[i] === tournamentPlayers[j]) {
                errors[i] = dico.tRaw("uniqueAliasAlert");
                errors[j] = dico.tRaw("uniqueAliasAlert");
            }
        }
    }

    const success = errors.every(msg => msg === "");

    return { success, errors };
}


