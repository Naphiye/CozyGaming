import { auth } from "../../authentication/auth.ts";
import { dico } from "../../dico/larousse.ts";
import { EmptyModal } from "../modal/EmptyModal.ts";
import { lockEveryClickInModal, unlockEveryClickInModal } from "../profile/2FAhandler/twoFAhandler.ts";
import { navigate } from "../../router.ts";
import { setPlaceHolderRequiredMsg } from "../DOM_helper.ts";
import { SignUpModal } from "./signUp.ts";

export async function fetchLogIn(username: string, password: string) {
    const lang = dico.getLanguage();
    const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": lang,
        },
        body: JSON.stringify({ username, password }),
    });
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.error || dico.tRaw("unknownError")); // data.error vient du back
    }
    return data.user;
}

export async function fetchLoginResendMailFACode(username: string) {
    const lang = dico.getLanguage();
    const res = await fetch("/api/auth/login/resend", {
        method: "POST",
        credentials: "include",
        headers: {
            "Accept-Language": lang,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
    });
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.error || dico.tRaw("unknownError"));
    }
    return data.user;
}

export function LoginModal(container: HTMLDivElement) {
    const form = document.createElement('div');

    form.innerHTML = `
    <form>
        <div class="grid justify-center">
            <div class="flex flex-col justify-center text-center max-w-fit gap-y-3">
                <div class="flex flex-col items-center">
                    ${dico.t("EnterLoginOrMail")}
                    <input id="loginInput" class="placeHolder" type="text" 
                    placeholder="${dico.tRaw("loginOrEmail")}" maxlength="30" required="required" />
                </div>

                <div class="flex flex-col items-center">
                    ${dico.t("EnterPassword")}
                    <input id="passwordInput" class="placeHolder" type="password" 
                    placeholder="${dico.tRaw("password")}" required="required" maxlength="128" />
                </div>
            </div>
        </div>
        <p id="errorLogin" class="errorMessage">&nbsp;</p>
        <div class="lineForm my-2"></div>
        <div class="flex flex-col justify-center items-center">
            <div class="text-center linkToOtherModal w-fit">
                <span id="toSignup">${dico.t("noAccount")} ${dico.t("SignUp")}</span>
            </div>
        </div>
        
        <div class="flex place-content-center pt-[15px]">
            <button id="submitLogin" type="submit" class="formBtn">${dico.t("SignIn")}</button>
        </div>

    </form>
  `;

    // Création du modal
    const modal = EmptyModal({
        title: dico.t("SignIn"),
        children: form,
        onClose: () => {
            container.style.pointerEvents = "auto";
        }
    });

    const usernameInput = form.querySelector<HTMLInputElement>("#loginInput");
    const passwordInput = form.querySelector<HTMLInputElement>("#passwordInput");
    const errorEl = form.querySelector("#errorLogin");
    const submitBtn = form.querySelector<HTMLButtonElement>("#submitLogin");
    const formEl = form.querySelector("form");
    const toSignup = form.querySelector<HTMLSpanElement>("#toSignup");
    if (!formEl || !passwordInput || !usernameInput || !errorEl || !submitBtn || !toSignup) {
        console.error("missing content login");
        return;
    }

    setPlaceHolderRequiredMsg(usernameInput, "fillThisPlaceholder");
    setPlaceHolderRequiredMsg(passwordInput, "fillThisPlaceholder");
    // une fois que le DOM du modal est dans la page, on peut attacher les listeners
    toSignup.addEventListener("click", () => {
        modal.close();
        SignUpModal(container);
        return;
    });

    formEl.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        // blocage de tous les boutons
        lockEveryClickInModal(container, modal);
        try {
            errorEl.innerHTML = "&nbsp;";
            // le moment ou ca load on affiche loading a la place de submit
            submitBtn.textContent = dico.tRaw("loading");
            const user = await fetchLogIn(username, password);
            if (user.twoFA) {
                    window.location.href = user.url;
            }
            else {
                container.style.pointerEvents = "auto";
                modal.close();
                dico.setLanguage(user.lang); // charger la langue avec lequel user sest inscrit
                localStorage.removeItem("lang");
                auth.setUser(true, false); // maj auth on navigate pour rediriger vers / a coup sur a la connexion
                navigate("/");
            }
        } catch (err: any) {
            unlockEveryClickInModal(container, modal);

            errorEl.innerHTML = err.message;
            passwordInput.value = "";
        } finally {
            // on remet le bouton actif avec le message dorigine
            submitBtn.textContent = dico.tRaw("SignIn");
        }
    });
}
