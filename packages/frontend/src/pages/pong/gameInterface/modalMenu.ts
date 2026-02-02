import { dico } from "../../../dico/larousse";
import { setPlaceHolderRequiredMsg } from "../../DOM_helper.ts";
import { EmptyModal } from "../../modal/EmptyModal";
import { makeUsernameSchema } from "../../utils/utilsSchema.ts";
import { aliasValidation, tournoiValidation } from "../gameLogic/aliasValidation.ts";


// function lockButton(btn: HTMLButtonElement) {
//   btn.disabled = true;
//   btn.classList.add("disabledBtn"); // optionnel, pour visuel
// }

// function unlockButton(btn: HTMLButtonElement) {
//   btn.disabled = false;
//   btn.classList.remove("disabledBtn");
// }

// ==================== MODAL GUEST ====================
export function openPongGuestModal(startCallback: (alias: string) => void) {
    const form = document.createElement("div");

    form.innerHTML = `
    <form>
        <div class="grid justify-center">
            <div class="flex flex-col justify-center text-center gap-y-3">
                <div class="flex flex-col items-center">
                    <span>${dico.tRaw("EnterLogin")}</span>
                    <span class="descriptionModal">${dico.tRaw("pongNameDescription")}</span>
                    <input id="guestAlias" class="placeHolder" type="text" placeholder="${dico.tRaw("Login")}"
                        maxlength="30" required="required" />
                </div>
            </div>
        </div>

        <div class="mb-2 mt-3">
            <p id="guestError" class="errorMessage">&nbsp;</p>
        </div>
        <div class="lineForm my-2"></div>
        <div class="flex place-content-center pt-[15px]">
            <button type="submit" class="formBtn">${dico.t("startGame")}</button>
        </div>
    </form>
    `;

    const modalEl = EmptyModal({
        title: dico.t("playGuest"),
        children: form,
    });

    const formEl = form.querySelector("form");
    const aliasInput = form.querySelector<HTMLInputElement>("#guestAlias");
    const errorField = form.querySelector<HTMLParagraphElement>("#guestError");

    if (!formEl || !aliasInput || !errorField) {
        console.error("Erreur : éléments du formulaire introuvables dans openPongGuestModal");
        return;
    }
    setPlaceHolderRequiredMsg(aliasInput, "fillThisPlaceholder");

    formEl.addEventListener("submit", async (event) => {
        event.preventDefault();

        const alias = aliasInput.value.trim();
        errorField.innerHTML = `&nbsp;`;
        const schema = makeUsernameSchema();
        const parseResult = schema.safeParse(alias);
        if (!parseResult.success) {
            errorField.textContent = parseResult.error.issues[0].message;
            return; // stop avant fetch
        }
        const err = await aliasValidation(alias);

        if (err) {
            errorField.textContent = err;
            return;
        }

        // Ferme le modal si possible
        modalEl.close?.();
        startCallback(alias);
    });
}

// ==================== MODAL TOURNOI ====================
export function openTournamentModal(username: string, startCallback: (players: string[]) => void) {
    const form = document.createElement("div");

    form.innerHTML = `
    <form>
        <div class="grid justify-center">
            <div class="flex flex-col justify-center text-center ">
                <div class="flex flex-col items-center">
                    <span>${dico.tRaw("EnterLoginTournament")}</span>
                    <span class="descriptionModal">${dico.tRaw("pongNameDescription")}</span>
                </div>
                <div class="flex flex-col items-center">
                    <span>${dico.tRaw("EnterLoginP1")}</span>
                    <input id="player1" class="placeHolder mb-1" type="text" placeholder="${dico.tRaw("LoginP1")}"
                        maxlength="30" required="required" />
                    <p id="err1" class="errorMessage">&nbsp;</p>
                </div>
                <div class="flex flex-col items-center">
                    <span>${dico.tRaw("EnterLoginP2")}</span>
                    <input id="player2" class="placeHolder mb-1" type="text" placeholder="${dico.tRaw("LoginP2")}"
                        maxlength="30" required="required" />
                    <p id="err2" class="errorMessage">&nbsp;</p>
                </div>
                <div class="flex flex-col items-center">
                    <span>${dico.tRaw("EnterLoginP3")}</span>
                    <input id="player3" class="placeHolder mb-1" type="text" placeholder="${dico.tRaw("LoginP3")}"
                        maxlength="30" required="required" />
                    <p id="err3" class="errorMessage">&nbsp;</p>
                </div>
            </div>
        </div>
        <div class="lineForm my-2"></div>
        <div class="flex place-content-center pt-[15px]">
            <button type="submit" class="formBtn">${dico.t("startGame")}</button>
        </div>
    </form>
  `;

    const modalEl = EmptyModal({
        title: dico.t("createTournament"),
        children: form,
    });

    const formEl = form.querySelector("form");
    const p1 = form.querySelector<HTMLInputElement>("#player1");
    const p2 = form.querySelector<HTMLInputElement>("#player2");
    const p3 = form.querySelector<HTMLInputElement>("#player3");
    const err1 = form.querySelector<HTMLParagraphElement>("#err1");
    const err2 = form.querySelector<HTMLParagraphElement>("#err2");
    const err3 = form.querySelector<HTMLParagraphElement>("#err3");

    if (!formEl || !p1 || !p2 || !p3 || !err1 || !err2 || !err3) {
        console.error("Erreur : éléments du formulaire introuvables dans openTournamentModal");
        return;
    }
    setPlaceHolderRequiredMsg(p1, "fillThisPlaceholder");
    setPlaceHolderRequiredMsg(p2, "fillThisPlaceholder");
    setPlaceHolderRequiredMsg(p3, "fillThisPlaceholder");

    formEl.addEventListener("submit", async (event) => {
        event.preventDefault();

        err1.innerHTML = `&nbsp;`;
        err2.innerHTML = `&nbsp;`;
        err3.innerHTML = `&nbsp;`;

        const players = [username, p1.value.trim(), p2.value.trim(), p3.value.trim()];

        const validation = await tournoiValidation(players);

        if (!validation.success) {
            if (validation.errors[0]) err1.textContent = validation.errors[0];
            if (validation.errors[1]) err2.textContent = validation.errors[1];
            if (validation.errors[2]) err3.textContent = validation.errors[2];
            return;
        }

        modalEl.close?.();
        startCallback(players);
    });
}
