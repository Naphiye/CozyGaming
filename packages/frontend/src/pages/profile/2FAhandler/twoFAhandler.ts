import { dico } from "../../../dico/larousse.ts";
import { confirmFormTwoBtn } from "../../DOM_helper.ts";
import { EmptyModal } from "../../modal/EmptyModal.ts";
import { EmailCooldownManager } from "./utils/EmailCooldownManager.ts";
import { loadingForm, successFAForm } from "./utils/different_form.ts";
import { fetchUserSendTwoFAMail, fetchVerifyFACode, } from "./utils/fetch2FA.ts"
import type { trad } from "../../friends/utils/btnHandler/formConfirm.ts";
import { handleTwoFACodeForm, type TwoFAOptions } from "./utils/handleTwoFACodeForm.ts";
/////////////////////////////////////////////////////////////////////////
/////////    UTILS 2FA
// changer le visuel et letat du bouton activer/desactiver
function updateTwoFABtn(btn: HTMLButtonElement, isActive: boolean) {
    if (isActive) {
        btn.innerHTML = dico.t("Deactivate2fa");
        btn.dataset.newState = "0";
        btn.classList.remove("activateBtn");
        btn.classList.add("deactivateBtn");
    } else {
        btn.innerHTML = dico.t("Activate2fa");
        btn.dataset.newState = "1";
        btn.classList.remove("deactivateBtn");
        btn.classList.add("activateBtn");
    }
}

export function lockEveryClickInModal(container: HTMLDivElement,
    modal: ReturnType<typeof EmptyModal>) {
    container.style.pointerEvents = "none";
    modal.style.pointerEvents = "none";
}
export function unlockEveryClickInModal(container: HTMLDivElement,
    modal: ReturnType<typeof EmptyModal>) {
    container.style.pointerEvents = "auto";
    modal.style.pointerEvents = "auto";
}
/////////////////////////////////////////////////////////////////////////
/////////    Handler 2FA
/*
setupTwoFA: cette fonction sert a init notre 2FA options en fonction de si on veut activate ou desactivate
elle est appelée seulement dans le dashboard car elle appelle le twoFAform qui elle sert le form avec la verification du code
cette fonction init le cooldown manager et envoie le mail lors du click
Le TwoFAOptions est utilisé pour la fonction handleTwoFAForm
ca permet de definir les fonctions quon veut utilisé en fonction du success ou echec de notre form
ou les fonctions comme le verify ou le send email qui est different du login par exemple
*/
async function setupTwoFA(container: HTMLDivElement, modal: ReturnType<typeof EmptyModal>,
    form: HTMLDivElement,
    twoFABtn: HTMLButtonElement,
    newState: boolean) {

    // twoFAProfile(TwoFAOptions);
    lockEveryClickInModal(container, modal);
    form.innerHTML = loadingForm();
    const coolDown = EmailCooldownManager.getRemaining();

    try {
        if (coolDown === 0) {
            // envoie de lemail pour activer
            await fetchUserSendTwoFAMail(newState);
            // enregistrer la date du cooldown la premiere fois dans session comme ca si on ferme/reouvre on peut envoyer
            EmailCooldownManager.addStorage();
        }
        const TwoFAOptions: TwoFAOptions = {
            container: container,
            modal: modal,
            form: form,
            profile: { profileNewState: newState, profileTwoFaBtn: twoFABtn, isEnabled: newState },
            fetchResendEmail: async () => { await fetchUserSendTwoFAMail(newState) },
            fetchVerifyFACode: async (id: number, code: string) => { await fetchVerifyFACode(id, code, newState) },
            codeSuccess: () => {
                EmailCooldownManager.removeStorage();
                outTwoFAStatus(container, newState);
                updateTwoFABtn(twoFABtn, newState); // update si reussi
                container.style.pointerEvents = "auto";

                form.innerHTML = successFAForm(newState === true ? "activationFAsuccess" : "deactivationFAsuccess");
                modal.enableBackdropClose(); // retablir le clic de derriere
                const okBtn = form.querySelector<HTMLButtonElement>("#ok");
                if (!okBtn) {
                    console.error("missing content in FA btn form");
                    return;
                }
                okBtn.addEventListener("click", async () => {
                    modal.close();
                });
            },
            onFinnalyCode: () => {
                modal.style.pointerEvents = "auto"; // retablir les clics
            }
        }
        handleTwoFACodeForm(TwoFAOptions);
    } catch (err: any) {
        console.error(err.message);
    }
    finally {
        unlockEveryClickInModal(container, modal);
    }
}

/////////////////////////////////////////////////////////////////////////
/////////    DESACTIVATION 2FA
// cette fonction appelle le setup2fa mais dabord je trigger un form estce que je suis sur de vouloir desactiver
async function deactivationTwoFA(container: HTMLDivElement,
    modal: ReturnType<typeof EmptyModal>,
    form: HTMLDivElement,
    twoFABtn: HTMLButtonElement,
    newState: boolean) {
    const trad: trad = {
        titleForm: "",
        contentForm: "confirmationDeactivationFA",
        actionBtn: "deactivateConfirmationBtn",
        noActionBtn: "keepTwoFA"
    }
    // MODAL DE CONFIRMATION : UPDATE du modal deja existant
    form.innerHTML = confirmFormTwoBtn(trad);

    // si on clic pour garder le 2fa on se barre juste
    const noActionBtn = form.querySelector<HTMLButtonElement>("#noActionBtn");
    const actionBtn = form.querySelector<HTMLButtonElement>("#actionBtn");
    if (!noActionBtn || !actionBtn) {
        console.error("missing content in deactivatefa");
        return;
    }

    noActionBtn.addEventListener("click", () => {
        modal.close();
    });
    // si on veut DESACTIVER LE 2FA
    actionBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        await setupTwoFA(container, modal, form, twoFABtn, newState);
    });
}


function outTwoFAStatus(container: HTMLDivElement, twoFA: boolean) {
    const twoFAId = container.querySelector<HTMLSpanElement>("#twoFAStatusId");
    if (!twoFAId) {
        console.error("missing content for output twofa status");
        return;
    }
    twoFAId.innerHTML = twoFA ? `${dico.t("activated")}` : `${dico.t("inactivated")}`;
}

/////////////////////////////////////////////////////////////////////////
/////////    MAIN FUNCTION 2FA
// gere lactivation et la desactivation du 2FA
export function twoFAhandler(container: HTMLDivElement, isValid: boolean) {
    const twoFABtn = container.querySelector<HTMLButtonElement>("#twoFABtn");
    if (!twoFABtn) {
        return console.error("#twoFABtn is missing");
    }

    // on le charge une premiere fois hors fonction click
    updateTwoFABtn(twoFABtn, isValid);
    outTwoFAStatus(container, isValid);
    // donc la on clique sur le bouton activer/desactiver
    twoFABtn.addEventListener("click", async () => {
        const newState = twoFABtn.dataset.newState === "1" ? true : false; // notre nouveau state est dans le bouton

        // Création du modal vraiment vide car on va direct edit en fonction de ce quon veut
        const form = document.createElement('div');
        form.innerHTML = ``;
        const modal = EmptyModal({
            title: dico.t("twoFAmodalTitle"),
            children: form,
            onClose: () => { // remettre les clic du container pour si on clique sur la croix du modal
                container.style.pointerEvents = "auto";
            }
        });

        if (newState === true) {
            await setupTwoFA(container, modal, form, twoFABtn, newState);
        }
        else {
            await deactivationTwoFA(container, modal, form, twoFABtn, newState);
        }
    });
}
