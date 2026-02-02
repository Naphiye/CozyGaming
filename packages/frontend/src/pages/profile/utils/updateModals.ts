import { fetchUpdatePassword, fetchUpdateMail, fetchUpdateUserLang, fetchUpdateUsername } from "./fetch.ts";
import { EmptyModal } from "../../modal/EmptyModal.ts";
import { dico } from "../../../dico/larousse.ts";
import { confirmModalOneBtn } from "../../DOM_helper.ts";
import { lockEveryClickInModal, unlockEveryClickInModal } from "../2FAhandler/twoFAhandler.ts";
import { makeMailSchema, makePasswordSchema, makeUsernameSchema } from "../../utils/utilsSchema.ts"

export function UpdatePasswordModal(container: HTMLDivElement) {
    const form = document.createElement('div');

    form.innerHTML = `
    <form>
       <div class="grid justify-center">
           <div class="flex flex-col justify-center text-center gap-y-3">
                <div class="flex flex-col items-center">
                   <span>${dico.tRaw("enterCurrentPassword")}</span>
                   <input id="currentPasswordInput" class="placeHolder mb-1" maxlength="128" type="password" placeholder="${dico.tRaw("currentPassword")}" required="required" />
               </div>
               <div class="flex flex-col items-center">
                   <span>${dico.tRaw("enterNewPassword")}</span>
                   <span class="descriptionModal">${dico.tRaw("passwordDescription")}</span>
                   <input id="newPasswordInput" class="placeHolder mb-1" maxlength="128" type="password" placeholder="${dico.tRaw("newPassword")}" required="required" />
                   <input id="confirmNewPasswordInput" class="placeHolder" maxlength="128" type="password" placeholder="${dico.tRaw("confirmedNewPassword")}" required="required" />
               </div>
            </div>
       </div>

        <!-- ELEMENTS FOR SUCCESS AND FAIL MESSAGES -->
    
        <div class="mb-2 mt-3">
            <p id="modifyPasswordSuccess" class="succesMessage"></p>
            <p id="modifyPasswordError" class="errorMessage">&nbsp;</p>
        </div>
        <div class="lineForm my-2"></div>  
        <div class="flex place-content-center pt-[15px]">
            <button id="submitNewPassword" type="submit" class="formGreenHoverBtn">${dico.t("modifyPassword")}</button>
        </div>

    </form>

  `;

    const modal = EmptyModal({
        title: dico.t("modifyPassword"),
        children: form,
    });

    const currentPasswordInput = form.querySelector<HTMLInputElement>("#currentPasswordInput");
    const newPasswordInput = form.querySelector<HTMLInputElement>("#newPasswordInput");
    const confirmNewPasswordInput = form.querySelector<HTMLInputElement>("#confirmNewPasswordInput");
    const errorElem = form.querySelector<HTMLParagraphElement>("#modifyPasswordError");
    const successElem = form.querySelector<HTMLParagraphElement>("#modifyPasswordSuccess");
    const modifyForm = form.querySelector("form");
    if (!modifyForm || !currentPasswordInput || !newPasswordInput || !confirmNewPasswordInput || !errorElem || !successElem) {
        console.error("missing content in profile password");
        return;
    }

    modifyForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        // Vérification que les mots de passe correspondent
        if (newPassword !== confirmNewPassword) {
            errorElem.innerHTML = dico.tRaw("passwordDontMatch");
            successElem.innerHTML = "";
            return; // stop avant fetch
        }

        //check if new password is OK
        const schema = makePasswordSchema();
        const parseResult = schema.safeParse(newPassword);
        if (!parseResult.success) {
            errorElem.innerHTML = parseResult.error.issues[0].message;
            successElem.innerHTML = "";
            return; // stop avant fetch
        }

        lockEveryClickInModal(container, modal);
        try {
            errorElem.innerHTML = "&nbsp;";
            successElem.innerHTML = "";
            await fetchUpdatePassword(currentPassword, newPassword, confirmNewPassword);
            modal.close();
            confirmModalOneBtn(dico.tRaw("modifyPassword"), dico.tRaw("passwordUpdated"), true);
        } catch (err: any) {
            successElem.innerHTML = "";
            errorElem.innerHTML = err.message;
            currentPasswordInput.value = "";
            newPasswordInput.value = "";
            confirmNewPasswordInput.value = "";
        } finally {
            unlockEveryClickInModal(container, modal);
        }
    });

}



export function updateUsernameModal(container: HTMLDivElement) {
    const form = document.createElement('div');

    form.innerHTML = `
	<form>
       <div class="grid justify-center">
           <div class="flex flex-col justify-center text-center gap-y-3">
               <div class="flex flex-col items-center">
                    <span>${dico.tRaw("enterNewUsername")}</span>
                   <span class="descriptionModal">${dico.tRaw("loginDescription")}</span>
                   <input id="newNameInput" class="placeHolder" type="text" placeholder="${dico.tRaw("newUsername")}"
                      maxlength="30" required="required" />
               </div>
            </div>
       </div>
        <div class="mb-2 mt-3">
            <p id="modifyUsernameSuccess" class="succesMessage"></p>
            <p id="modifyUsernameError" class="errorMessage">&nbsp;</p>
        </div>
        <div class="lineForm my-2"></div>  
        <div class="flex place-content-center pt-[15px]">
            <button id="submitNewUsername" type="submit" class="formGreenHoverBtn">${dico.t("modifyUsername")}</button>
        </div>
	</form>

  `;

    const modal = EmptyModal({
        title: dico.t("modifyUsername"),
        children: form,
    });

    const newNameInput = form.querySelector<HTMLInputElement>("#newNameInput");
    const errorElem = form.querySelector<HTMLParagraphElement>("#modifyUsernameError");
    const successElem = form.querySelector<HTMLParagraphElement>("#modifyUsernameSuccess");
    const usernamePlace = container.querySelector<HTMLSpanElement>("#usernamePlace");
    const modifyForm = form.querySelector("form");

    if (!modifyForm || !newNameInput || !errorElem || !successElem || !usernamePlace) {
        console.error("missing content for set username modal");
        return;
    }

    modifyForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const newUsername = newNameInput.value;
        const actualUsername = usernamePlace.innerHTML;

        //check if input username is the same as the current one
        if (actualUsername === newUsername) {
            errorElem.innerHTML = dico.tRaw("sameUsernameError");
            successElem.innerHTML = "";
            return; // stop avant fetch
        }
        
        const schema = makeUsernameSchema();
        const parseResult = schema.safeParse(newUsername);
        if (!parseResult.success)
        {
            errorElem.innerHTML = parseResult.error.issues[0].message;
            successElem.innerHTML = "";
            return; // stop avant fetch
        }

        lockEveryClickInModal(container, modal);

        try {
            errorElem.innerHTML = "&nbsp;";
            successElem.innerHTML = "";
            await fetchUpdateUsername(newUsername);
            usernamePlace.innerHTML = newUsername;
            modal.close();
            confirmModalOneBtn(dico.tRaw("modifyUsername"), dico.tRaw("usernameUpdated"), true);
        } catch (err: any) {
            successElem.innerHTML = "";
            errorElem.innerHTML = err.message;
            newNameInput.value = "";
        } finally {
            unlockEveryClickInModal(container, modal);
        }
    });
}

export function updateEmailModal(container: HTMLDivElement) {
    const form = document.createElement('div');

    form.innerHTML = `
	<form>
       <div class="grid justify-center">
           <div class="flex flex-col justify-center text-center gap-y-3">
               <div class="flex flex-col items-center">
                   <span>${dico.tRaw("enterNewMail")}</span>
                   <span class="descriptionModal">${dico.tRaw("emailDescription")}</span>
                   <input id="newMailInput" class="placeHolder mb-1" type="email" placeholder="${dico.tRaw("newEmail")}" required="required" />
                   <input id="confirmedEmailInput" class="placeHolder" type="email" placeholder="${dico.tRaw("confirmNewMail")}"
                       required="required" />
               </div>
            </div>
       </div>



		<!-- ELEMENTS FOR SUCCESS AND FAIL MESSAGES -->
        <div class="mb-2 mt-3">
            <p id="modifyMailSuccess" class="succesMessage"></p>
            <p id="modifyMailError" class="errorMessage">&nbsp;</p>
        </div>
        <div class="lineForm my-2"></div>  
        <div class="flex place-content-center pt-[15px]">
            <button id="submitNewMail" type="submit" class="formGreenHoverBtn">${dico.t("modifyMail")}</button>
        </div>

	</form>

  `;

    const modal = EmptyModal({
        title: dico.t("modifyMail"),
        children: form,
    });

    const confirmedEmailInput = form.querySelector<HTMLInputElement>("#confirmedEmailInput");
    const newMailInput = form.querySelector<HTMLInputElement>("#newMailInput");
    const errorElem = form.querySelector<HTMLParagraphElement>("#modifyMailError");
    const successElem = form.querySelector<HTMLParagraphElement>("#modifyMailSuccess");
    const mailPlace = container.querySelector<HTMLSpanElement>("#mailPlace");
    const modifyForm = form.querySelector("form");
    if (!confirmedEmailInput || !newMailInput || !errorElem || !successElem || !modifyForm || !mailPlace) {
        console.log("missing element in profile");
        return;
    }

    modifyForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const confirmedNewMail = confirmedEmailInput.value;
        const newMail = newMailInput.value;


        //check if input email is correct
        if (confirmedNewMail !== newMail) {
            errorElem.innerHTML = dico.tRaw("emailDontMatch");
            successElem.innerHTML = "";
            return; // stop avant fetch
        }

        //check new email if it's valid
        const schema = makeMailSchema();
        const parseResult = schema.safeParse(newMail);
        if (!parseResult.success) {
            errorElem.innerHTML = parseResult.error.issues[0].message;
            successElem.innerHTML = "";
            return; // stop avant fetch
        }



        lockEveryClickInModal(container, modal);

        try {
            errorElem.innerHTML = "&nbsp;";
            successElem.innerHTML = "";
            await fetchUpdateMail(confirmedNewMail, newMail);
            mailPlace.innerHTML = newMail;
            modal.close();
            confirmModalOneBtn(dico.tRaw("modifyMail"), dico.tRaw("emailUpdated"), true);
        } catch (err: any) {
            confirmedEmailInput.value = "";
            newMailInput.value = "";
            successElem.innerHTML = "";
            errorElem.innerHTML = err.message;
        } finally {
            unlockEveryClickInModal(container, modal);
        }
    });
}


function checkCurrentLang(container: HTMLDivElement) {
    const currentLang = dico.getLanguage();
    const checkRadio = container.querySelector<HTMLInputElement>(`input[name="lang"][value="${currentLang}"]`);

    if (checkRadio) {
        checkRadio.checked = true;
    }
}


export function setTheLang(container: HTMLDivElement) {
    const langRadios = container.querySelectorAll<HTMLInputElement>('input[name="lang"]');

    if (!langRadios) {
        console.error("missing element in profile lang");
        return;
    }

    checkCurrentLang(container);

    langRadios.forEach(radio => {
        radio.addEventListener("change", async () => {
            const chosenLanguage = radio.value;
            try {
                await fetchUpdateUserLang(chosenLanguage);
                dico.setLanguage(chosenLanguage);
            } catch (err: any) {
                confirmModalOneBtn(dico.tRaw("ErrorInModifyLang"), err.message ?? dico.tRaw("selectLanguageError"))
            }
        });
    });
}


