import { navigate } from "../router.ts";
import { EmailCooldownManager } from "../pages/profile/2FAhandler/utils/EmailCooldownManager.ts";
import { dico } from "../dico/larousse.ts";

export let ws: WebSocket | null;

async function initRefresh() {
    try {
        const refreshRes = await fetch("/api/access_token", { credentials: "include" });
        if (!refreshRes.ok) {
            if (refreshRes.status === 498) {
                auth.setUser(false, false);
                navigate(window.location.search);
            }
            throw ({ message: dico.tRaw("tokenRefreshFail") });
        }
        const data = await refreshRes.json();
        if (!data.user) {
            throw ({ message: dico.tRaw("problemWithRefresh") });
        }
        auth.setUser(data.user, true);
        dico.setLanguage(data.user.lang);
    } catch (err: any) {
        // charger langue de localstorage si yen a une et dans les boutons changement de langue envoyer dans le localstorage
        const lang = localStorage.getItem("lang");
        if (lang) {
            dico.setLanguage(lang);
        }
        auth.setUser(false, true);
    } finally {
        auth.setLoading(false); // met fin au loading et notifie automatiquement
    }
}

type User = boolean;
class AuthManager {
    user: User = false;
    loading: boolean = true;
    private listeners: (() => void)[] = [];

    constructor() {
        initRefresh();
    }

    setLoading(v: boolean) {
        this.loading = v;
        this.notify();
    }

    setUser(u: User, navigate: boolean) {
        this.user = u;
        // donc if user jouvre la socket
        if (u) {
            if (window.location.href === "https://localhost:8443/") {
                ws = new WebSocket(`wss://localhost:8443/api/ws`);
            }
            else {
                ws = new WebSocket(`/api/ws`);
            }
            ws.onopen = () => {
                console.log("WS connected from front");
            };
        }
        // si user est null =  deconnexion donc fermer la socket 
        if (!u && ws) {
            ws.close();
            ws.onclose = () => {
                console.log("WS deconnected from the front");
            };
        }
        if (navigate) {
            this.notify();
        }
    }

    async logout() {
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
            EmailCooldownManager.removeStorage();
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            this.setUser(false, false);
            navigate("/");
        }
    }

    subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(l => l());
    }
}

export const auth = new AuthManager();
