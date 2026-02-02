import { auth } from "../../../authentication/auth";
import { dico } from "../../../dico/larousse";
import { navigate } from "../../../router";

export async function fetchRegisterMatchHistory(matchData: {
    mode: "classic" | "ai" | "tournament";
    playerLeft: string;
    scoreLeft: number;
    playerRight: string;
    scoreRight: number;
    userplace: string;
    date: number;
}) {
    const lang = dico.getLanguage();
    const res = await fetch("/api/pong/matchhistory", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": lang,
        },
        body: JSON.stringify(matchData),
    });

    if (!res.ok) {
        const data = await res.json();
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }
        throw new Error(data.error || dico.tRaw("unknownError"));
    }

    return res.json();
}


export async function fetchMatchHistoryByUsername(username: string) {
    const lang = dico.getLanguage();

    const res = await fetch(`/api/pong/matchhistory/${username}`, {
        method: "GET",
        headers: {
            "Accept-Language": lang,
        },
    });

    // Pour les autres erreurs, on lance une exception
    if (!res.ok || res.status === 401) {
        const data = await res.json();
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }
        throw new Error(data.error || dico.tRaw("unknownError"));
    }

    return res.json();
}

export async function fetchTournamentMatchByDate(username: string, date: number): Promise<boolean> {
    const lang = dico.getLanguage();
    const res = await fetch(`/api/pong/matchhistory/checkTournamentMatch/${username}/${date}`, {
        method: "GET",
        headers: {
            "Accept-Language": lang,
        },
    });

    if (!res.ok) {
        const data = await res.json();
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }
        throw new Error(data.error || dico.tRaw("unknownError"));
    }

    const data = await res.json();
    return data.exists as boolean;
}
