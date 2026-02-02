import { auth } from "../../../authentication/auth";
import { dico } from "../../../dico/larousse";
import { navigate } from "../../../router";
import { Match } from "../gameObjects/match";

interface PongStats {
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    tournamentsOrganized: number;
}


export async function fetchPongStats(username: string): Promise<PongStats> {
    const lang = dico.getLanguage();
    try {
        const res = await fetch(`/api/pong/matchhistory/${username}`, {
            method: "GET",
            headers: {
                "Accept-Language": lang,
            },
        });
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }

        // Aucun match trouvé → stats à zéro
        if (res.status === 404) {
            return {
                matchesPlayed: 0,
                matchesWon: 0,
                matchesLost: 0,
                tournamentsOrganized: 0,
            };
        }

        if (!res.ok) {
            const data = await res.json();
            if (res.status === 498) {
                auth.setUser(false, false);
                navigate("/");
            }
            throw new Error(data.error || dico.tRaw("unknownError"));
        }

        const data: { username: string; matches: Match[] } = await res.json();
        const matches = data.matches || [];

        // Calcul des stats
        let matchesPlayed = matches.length;
        let matchesWon = 0;
        let matchesLost = 0;
        let tournamentsOrganized = 0;

        for (const match of matches) {
            // Victoire/défaite
            let playerScore = match.playerLeft === username ? match.scoreLeft : match.scoreRight;
            let opponentScore = match.playerLeft === username ? match.scoreRight : match.scoreLeft;

            if (playerScore > opponentScore) matchesWon++;
            else matchesLost++;

            // Tournoi
            if (match.mode === "tournament") tournamentsOrganized++;
        }
        tournamentsOrganized = tournamentsOrganized / 3;

        return { matchesPlayed, matchesWon, matchesLost, tournamentsOrganized };

    } catch (err) {
        console.error("Impossible de récupérer les stats Pong :", err);
        return {
            matchesPlayed: 0,
            matchesWon: 0,
            matchesLost: 0,
            tournamentsOrganized: 0,
        };
    }
}
