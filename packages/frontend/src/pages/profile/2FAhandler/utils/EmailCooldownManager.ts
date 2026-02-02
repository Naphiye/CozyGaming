// cest les fonctions pour gerer laffichage, le bouton resend, le debut et la fin du compteur
// tout ca regroupé dans un seul objet pour pouvoir tout manipuler grace a lui
import { dico } from "../../../../dico/larousse";

export const EmailCooldownManager = {
    EMAIL_COOLDOWN: 120, // secondes pour des tests RAPIDES
    LAST_EMAIL_KEY: "last2FAEmailSentAt",

    getRemaining(): number {
        const lastSent = parseInt(sessionStorage.getItem(this.LAST_EMAIL_KEY) || "0", 10);
        const elapsed = (Date.now() - lastSent) / 1000;
        return Math.max(0, this.EMAIL_COOLDOWN - elapsed);
    },

    startTimer(cooldownEl: HTMLButtonElement): () => void {
        const updateUI = () => {
            const remaining = this.getRemaining();
            if (remaining > 0) {
                // changer la class car le bouton doit etre bloqué du clic donc enlever limage du clic
                cooldownEl.className = "formBtn";
                cooldownEl.disabled = true;
                cooldownEl.textContent = `${Math.ceil(remaining)}`;
            } else {
                cooldownEl.className = "formBtn";
                cooldownEl.textContent = `${dico.tRaw("resendEmail")}`;
                cooldownEl.disabled = false;
            }
        };

        updateUI();
        const interval = setInterval(updateUI, 1000);
        return () => clearInterval(interval);
    },

    addStorage(): void {
        sessionStorage.setItem(this.LAST_EMAIL_KEY, Date.now().toString());
    },

    removeStorage(): void {
        sessionStorage.removeItem(this.LAST_EMAIL_KEY);
    }
}