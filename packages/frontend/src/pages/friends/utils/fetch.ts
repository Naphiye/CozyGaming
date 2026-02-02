import { auth } from "../../../authentication/auth";
import { dico } from "../../../dico/larousse";
import { navigate } from "../../../router";

// ajouter un ami
export async function fetchAddFriend(userId: number) {
    const lang = dico.getLanguage();
    const res = await fetch("/api/users/me/friends/add", {
        method: "POST",
        credentials: "include",
        headers: {
            "Accept-Language": lang,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!res.ok) {
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }
        throw new Error(data.error || dico.tRaw("unknownError"));
    }
    return data.newUserAdded;
}

// remove une relation
export async function fetchRemoveFriend(userId: number) {
    const lang = dico.getLanguage();
    const res = await fetch("/api/users/me/friends/remove", {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Accept-Language": lang,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    if (!res.ok) {
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }
        throw new Error(data.error || dico.tRaw("unknownError"));
    }
    return data.user;
}

export async function fetchBlockFriend(userId: number) {
    const lang = dico.getLanguage();
    const res = await fetch("/api/users/me/friends/block", {
        method: "POST",
        credentials: "include",
        headers: {
            "Accept-Language": lang,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!res.ok) {
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }
        throw new Error(data.error || dico.tRaw("unknownError"));
    }
    return data.newUserBlocked;
}
