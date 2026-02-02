import { auth } from "../../../authentication/auth.ts";
import { dico } from "../../../dico/larousse.ts";
import { navigate } from "../../../router.ts";

export async function fetchUserMe() {
    const lang = dico.getLanguage();
    const res = await fetch("/api/users/me", {
        method: "GET",
        credentials: "include",
        headers: {
            "Accept-Language": lang,
        },
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

// UPDATE FUNCTIONS: PUT REQUESTS *********************
export async function fetchUpdateUsername(inputUsername: string) {
    const lang = dico.getLanguage();

    if (!inputUsername)
        throw new Error(dico.tRaw("usernameEmpty"));

    const res = await fetch("/api/users/me/update/username", {
        method: "PUT",
        credentials: "include",
        headers: {
            "Accept-Language": lang,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputUsername }),
    });

    const data = await res.json();

    if (!res.ok) {
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }
        throw new Error(data.error || dico.tRaw("unknownError"))
    }
    return data;
}

export async function fetchUpdatePassword(inputCurrentPassword: string, inputNewPassword: string, inputConfirmNewPassword: string) {
    const lang = dico.getLanguage();

    const res = await fetch("/api/users/me/update/password", {
        method: "PUT",
        credentials: "include",
        headers: {
            "Accept-Language": lang,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            currentPassword: inputCurrentPassword,
            newPassword: inputNewPassword, confirmNewPassword: inputConfirmNewPassword
        }),
    });

    const data = await res.json();

    if (!res.ok) {
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }
        throw new Error(data.error || dico.tRaw("failPassword"))
    }
    return data;
}

export async function fetchUpdateMail(confirmedNewMail: string, inputNewMail: string) {
    const lang = dico.getLanguage();

    const res = await fetch("/api/users/me/update/email", {
        method: "PUT",
        credentials: "include",
        headers: {
            "Accept-Language": lang,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmedNewMail: confirmedNewMail, newMail: inputNewMail }),
    });

    const data = await res.json();

    if (!res.ok) {
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }
        throw new Error(data.error || dico.tRaw("failMail"))
    }
    return data;
}

export async function fetchUpdateUserLang(chosenLanguage: string) {
    const lang = dico.getLanguage();

    const res = await fetch("/api/users/me/update/lang", {
        method: "PUT",
        credentials: "include",
        headers: {
            "Accept-Language": lang,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ newLang: chosenLanguage }),
    });

    const data = await res.json();

    if (!res.ok) {
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }
        throw new Error(data.error || dico.tRaw("selectLanguageError"))
    }

    return data;
}

export async function fetchUpdateAvatar(newAvatar: FormData) {
    const lang = dico.getLanguage();

    const res = await fetch("/api/users/me/update/avatar", {
        method: "PUT",
        credentials: "include",
        headers: {
            "Accept-Language": lang,
        },
        body: newAvatar,
    });
    const data = await res.json();
    if (!res.ok) {
        if (res.status === 498) {
            auth.setUser(false, false);
            navigate("/");
        }
        throw new Error(data.error || dico.tRaw("failAvatar"));
    }
    return data;
}
