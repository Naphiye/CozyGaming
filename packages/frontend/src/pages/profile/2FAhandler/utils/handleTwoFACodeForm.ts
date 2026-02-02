import { dico } from "../../../../dico/larousse.ts";
import { confirmModalOneBtn, setPlaceHolderRequiredMsg } from "../../../DOM_helper.ts";
import { EmptyModal } from "../../../modal/EmptyModal.ts";
import { lockEveryClickInModal } from "../twoFAhandler";
import { EmailCooldownManager } from "../utils/EmailCooldownManager.ts";
import { enterCodeFAForm } from "../utils/different_form.ts";

export type TwoFAOptions = {
    container: HTMLDivElement, // le main container
    modal: ReturnType<typeof EmptyModal>, // le modal sur lequel on est
    form: HTMLElement, // l'html du modal

    loginUser?: { id: number, lang: string }, // si on a un user pour le login par exemple
    profile?: { profileNewState: boolean, profileTwoFaBtn: HTMLButtonElement, isEnabled: boolean }, // les elements pour le profile

    // functions : callback()
    onCloseExtra?: () => void, // quand on est sur login il faut pas oublier de remove storage
    fetchResendEmail: () => Promise<void>,
    fetchVerifyFACode: (userId: number, code: string, isEnabled: boolean) => Promise<void>,
    codeSuccess: () => void, // ce quon doit faire si cest un succes
    onFinnalyCode: () => void,
}


export function handleTwoFACodeForm(opts: TwoFAOptions) {
    // donc ici je gere tout a partir de lentrée du code jusqua la fin de la mission => rentrer le code et valider
    opts.modal.disableBackdropClose(); // bloc le clic de derriere pour eviter miss clic par exemple
    opts.modal.style.pointerEvents = "auto"; // retablir les clics car on va rentrer un code

    // form qui demande le code
    opts.form.innerHTML = enterCodeFAForm();

    const resendEmailBtn = opts.form.querySelector<HTMLButtonElement>("#resendEmailBtn");
    if (!resendEmailBtn) {
        console.error("missing content login");
        return;
    }

    let stopCoolDown = EmailCooldownManager.startTimer(resendEmailBtn);
    // on change les fonction du onclose pour rajouter larret du timer
    opts.modal.setOnClose(() => {
        opts.container.style.pointerEvents = "auto";
        stopCoolDown(); // arrête le timer si actif
        // si je suis sur login faut je rajoute le remove storage ici
        opts.onCloseExtra?.();
    })

    // le bouton pour resend le mail
    resendEmailBtn.addEventListener("click", async () => {
        stopCoolDown();
        // on rebloque les clics lors du chargement de lemail
        lockEveryClickInModal(opts.container, opts.modal);
        resendEmailBtn.textContent = dico.tRaw("loading");
        // renvoyer un email
        try{
            await opts.fetchResendEmail()
        }
        catch(err: any){
            opts.modal.close();
            confirmModalOneBtn(dico.tRaw("resendEmailError"), err.message);
            return;
        } finally{
            opts.modal.style.pointerEvents = "auto"; // retablir les clics car on va rentrer un code
        }
        // on restart un timer
        EmailCooldownManager.addStorage();
        stopCoolDown = EmailCooldownManager.startTimer(resendEmailBtn);
    });

    const twoFAForm = opts.form.querySelector("form");
    const twoFAInput = opts.form.querySelector<HTMLInputElement>("#twoFAInput");
    const errorEl = opts.form.querySelector("#errorCode");
    if (!twoFAInput || !twoFAForm || !errorEl) {
        console.error("missing content in login");
        return;
    }

    setPlaceHolderRequiredMsg(twoFAInput, "fillThisPlaceholder");
    twoFAForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const twoFACode = twoFAInput.value;
        lockEveryClickInModal(opts.container, opts.modal);
        try {
            errorEl.innerHTML = "&nbsp;";
            await opts.fetchVerifyFACode(opts.loginUser?.id ?? 0, twoFACode, opts.profile?.isEnabled ?? false);
            opts.codeSuccess();

        } catch (err: any) {
            errorEl.textContent = err.message;
            twoFAInput.value = "";
        } finally {
            opts.onFinnalyCode();
        }
    });

}