import { dico } from "../../dico/larousse.ts";
import { setPlaceHolderRequiredMsg } from "../DOM_helper.ts";
import { EmptyModal } from "../modal/EmptyModal.ts";
import { lockEveryClickInModal, unlockEveryClickInModal } from "../profile/2FAhandler/twoFAhandler.ts";
import {  makeUsernameSchema, makeMailSchema, makePasswordSchema } from "../utils/utilsSchema.ts";
import { LoginModal } from "./logIn.ts";

async function fetchRegister(
    username: string,
    password: string,
    email: string,
) {
    const lang = dico.getLanguage(); // detecter la langue quon a change dans le front et la recuperer pour pouvoir lenvoyer
    const res = await fetch("/api/register", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": lang,
        },
        body: JSON.stringify({
            username,
            password,
            email,
        }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || dico.tRaw("unknownError")); // data.error vient du back
    }
}

export function SignUpModal(container: HTMLDivElement) {
    const form = document.createElement("div");

    form.innerHTML = `  
    <form>

       <div class="grid justify-center">
           <div class="flex flex-col justify-center text-center gap-y-3">
               <div class="flex flex-col items-center">
                   <span>${dico.tRaw("EnterLogin")}</span>
                   <span class="descriptionModal">${dico.tRaw("loginDescription")}</span>
                   <input id="signupLogin" maxlength="30" class="placeHolder" type="text" placeholder="${dico.tRaw("Login")}" required="required" />
               </div>
               <div class="flex flex-col items-center">
                   <span>${dico.tRaw("EnterEmail")}</span>
                   <span class="descriptionModal">${dico.tRaw("emailDescription")}</span>
                   <input id="signupMail" class="placeHolder mb-1" type="email" placeholder="${dico.tRaw("Email")}"
                       required="required" />
                    <input id="signupConfirmedMail" class="placeHolder" type="email" placeholder="${dico.tRaw("ConfirmedMail")}" required="required" />
               </div>

               <div class="flex flex-col items-center">
                   <span>${dico.tRaw("EnterPassword")}</span>
                   <span class="descriptionModal">${dico.tRaw("passwordDescription")}</span>
                   <input id="signupPassword" class="placeHolder mb-1" maxlength="128" type="password" placeholder="${dico.tRaw("password")}" required="required" />
                   <input id="signupConfirmedPass" class="placeHolder" maxlength="128" type="password" placeholder="${dico.tRaw("ConfirmedPassword")}" required="required" />
               </div>

           </div>
       </div>
        <div class="mb-2 mt-3">
            <p id="signupError" class="errorMessage">&nbsp;</p>
        </div>
        <div class="lineForm my-2"></div>
       <div class="flex flex-col justify-center items-center">
           <div class="text-center linkToOtherModal w-fit">
               <span id="toLogin"> ${dico.tRaw("alreadyAccount")} ${dico.tRaw("SignIn")}</span>
           </div>
       </div>

       <div class="flex place-content-center pt-[15px]">
           <button id="signupSubmit" type="submit" class="formBtn">
               ${dico.t("SignUp")}</button>
       </div>

   </form>
   `;

    // Création du modal
    const modal = EmptyModal({
        title: dico.t("SignUp"),
        children: form,
    });
    const toLogin = form.querySelector<HTMLSpanElement>("#toLogin");


    // on recupe les variables
    const loginInput = form.querySelector<HTMLInputElement>("#signupLogin");
    const emailInput = form.querySelector<HTMLInputElement>("#signupMail");
    const confirmedEmailInput = form.querySelector<HTMLInputElement>("#signupConfirmedMail");
    const passwordInput = form.querySelector<HTMLInputElement>("#signupPassword");
    const confirmedPasswordInput = form.querySelector<HTMLInputElement>("#signupConfirmedPass");
    const errorField = form.querySelector("#signupError");
    const formEl = form.querySelector("form");
    if (!toLogin || !formEl || !loginInput || !emailInput || !confirmedEmailInput || !passwordInput || !confirmedPasswordInput || !errorField) {
        console.error("missing content signup");
        return;
    }
    setPlaceHolderRequiredMsg(loginInput, "fillThisPlaceholder");
    setPlaceHolderRequiredMsg(emailInput, "fillThisPlaceholder");
    setPlaceHolderRequiredMsg(confirmedEmailInput, "fillThisPlaceholder");
    setPlaceHolderRequiredMsg(passwordInput, "fillThisPlaceholder");
    setPlaceHolderRequiredMsg(confirmedPasswordInput, "fillThisPlaceholder");

    toLogin.addEventListener("click", () => {
        modal.close();
        LoginModal(container);
        return;
    });
    // une fois que le DOM du modal est dans la page, on peut attacher les listeners
    formEl.addEventListener("submit", async (event) => {
        event.preventDefault();

        const login = loginInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmedPassword = confirmedPasswordInput.value;
        const confirmedEmail = confirmedEmailInput.value;

        if (password !== confirmedPassword) {
            errorField.textContent = dico.tRaw("passwordDontMatch");
            return;
        }
        
        if (email !== confirmedEmail) {
            errorField.textContent = dico.tRaw("emailDontMatch");
            return;
        }

        const schema = makeUsernameSchema();
        const parseResult = schema.safeParse(login);
        if (!parseResult.success) {
            errorField.textContent = parseResult.error.issues[0].message;
            return; // stop avant fetch
        }

        const mailschema = makeMailSchema();
        const mailParseResult = mailschema.safeParse(email);
        if (!mailParseResult.success) {
            errorField.textContent = mailParseResult.error.issues[0].message;
            return; // stop avant fetch
        }
        
        const passwordSchema = makePasswordSchema();
        const passParseResult = passwordSchema.safeParse(password);
        if (!passParseResult.success) {
            errorField.textContent = passParseResult.error.issues[0].message;
            return; // stop avant fetch
        }


        lockEveryClickInModal(container, modal);
        try {
            errorField.innerHTML = "&nbsp;";
            await fetchRegister(login, password, email);
            form.innerHTML = `
                <div class="cursor-default gap-y-1.5 text-center leading-7 mx-5 ">
                    ${dico.tRaw("successRegister")}
                </div>
                <div class="lineForm mt-4"></div>
                <div class="flex justify-between pt-[18px]">
                    <button id="ok" class="formBtn">
                    ${dico.t("confirmationBtn")}</button>
                    <button id="loginBtn" class="formBtn">
                    ${dico.t("SignIn")}</button>
                </div>
            `;
            const confirmationBtn = form.querySelector<HTMLButtonElement>("#ok");
            const loginBtn = form.querySelector<HTMLButtonElement>("#loginBtn");
            if (!confirmationBtn || !loginBtn) {
                console.error("missing content in errormessagemodal");
                return;
            }
            loginBtn.addEventListener("click", async (event) => {
                event.preventDefault();
                modal.close();
                LoginModal(container);
            });
            confirmationBtn.addEventListener("click", async (event) => {
                event.preventDefault();
                modal.close();
            });
        } catch (err: any) {
            errorField.textContent = err.message;
            confirmedEmailInput.value = "";
            confirmedPasswordInput.value = "";
            passwordInput.value = "";
        } finally {
            unlockEveryClickInModal(container, modal);
        }
    });
}
