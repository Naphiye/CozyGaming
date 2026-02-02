import { dico } from "../../../../dico/larousse";

// loading
export function loadingForm() {
    return `
      <div class="cursor-default text-center">
          ${dico.t("loading")}
      </div>`;
}

// asking for the code
export function enterCodeFAForm() {
    return `
<form>
    <div class="grid justify-center">
        <div class="flex flex-col justify-center text-center gap-y-3">
            <div class="flex flex-col items-center">
                <span>${dico.t("emailSendForCode")}</span>
                <input id="twoFAInput" class="placeHolder mb-1" type="text" placeholder="${dico.tRaw("TwoFACode")}" required="required" />
            </div>
        </div>
    </div>
    <div class="mb-2 mt-3">
        <p id="errorCode" class="errorMessage">&nbsp;</p>
    </div>
    <div class="lineForm my-2"></div>  
    <div class="flex justify-between pt-[18px]">
        <button id="resendEmailBtn" type="button"></button>
        <button id="submit2FA" type="submit" class="formBtn">${dico.t("OK")}</button>
    </div>

</form>
`;
}

export function successFAForm(content: string) {
    return `
        <div class="cursor-default gap-y-1.5 text-center leading-7 mx-5 text-green-500">
            ${dico.t(content)}
        </div>
         <div class="lineForm mt-4"></div>
        <div class="flex justify-center pt-[18px]">
            <button id="ok" class="formBtn">
            ${dico.t("confirmationBtn")}</button>
        </div>`;
}
