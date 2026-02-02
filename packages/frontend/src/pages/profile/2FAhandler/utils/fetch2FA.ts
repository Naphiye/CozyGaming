import { auth } from "../../../../authentication/auth.ts";
import { dico } from "../../../../dico/larousse.ts";
import { navigate } from "../../../../router.ts";

export async function fetchVerifyFACode(userId: number, code: string, isEnabled?: boolean | false) {
    const lang = dico.getLanguage();
    const res = await fetch("/api/users/me/2fa/checkcode", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": lang,
        },
        body: JSON.stringify({ userId, code, isEnabled }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || dico.tRaw("unknownError")); // data.error vient du back
    }
}


// envoie un code pour activer
export async function fetchUserSendTwoFAMail(enabled: boolean) {
    const lang = dico.getLanguage();
    const res = await fetch("/api/users/me/2fa/sendcode", {
        method: "POST",
        credentials: "include",
        headers: {
            "Accept-Language": lang,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
    });
    const data = await res.json()
    if (!res.ok) {
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }
        throw new Error(data.error || dico.tRaw("unknownError"));
    }
    return data.user;
}