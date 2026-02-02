import { auth } from "../../../authentication/auth.ts";
import { dico } from "../../../dico/larousse.ts";
import { navigate } from "../../../router.ts";
import { confirmModalOneBtn } from "../../DOM_helper.ts";
import { EmptyModal } from "../../modal/EmptyModal.ts";
import { outDeleteAvatarBtn } from "../utils/outBtnHtml.ts";

// DELETE AVATAR FUNCTION *********************

export async function fetchDeleteAvatar() {
    const lang = dico.getLanguage();
    const res = await fetch("/api/users/me/delete/avatar", {
        method: "DELETE",
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
        throw new Error(data.error ?? dico.tRaw("failDeleteAvatar"));
    }
}

export function deleteAvatarBtn(container: HTMLDivElement) {

    const form = document.createElement("div");
    form.innerHTML = `<div class="cursor-default text-center leading-7 mx-5">
            ${dico.t("deleteAvatarConfirmation")}
        </div>
        <div class="lineForm mt-4"></div>
        <div class="flex justify-between pt-[18px]">
           <button id="actionBtn" class="formRedBtn">
           ${dico.t("deleteAvatar")}</button>
           <button id="noActionBtn" class="formBtn">
           ${dico.t("closeBtn")}</button>
        </div>`;

    const modal = EmptyModal({
        title: dico.t("deleteAvatar"),
        children: form,
    });
    const actionBtn = modal.querySelector<HTMLButtonElement>("#actionBtn");
    const noActionBtn = modal.querySelector<HTMLButtonElement>("#noActionBtn");
    const avatarImg = container.querySelector<HTMLImageElement>("#avatarImg");
    if (!actionBtn || !noActionBtn || !avatarImg) {
        console.error("missing content for delete avatar");
        return;
    }
    noActionBtn.addEventListener("click", async () => {
        modal.close();
    });

    actionBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            if (avatarImg.src.endsWith("/default-avatar.png")) {
                modal.close();
                confirmModalOneBtn(dico.tRaw("ErrorInDeleteAvatar"), dico.tRaw("noAvatarToDelete"));
                return;
            }
            await fetchDeleteAvatar();
            avatarImg.src = "/api/uploads/default-avatar.png";
            modal.close();
            confirmModalOneBtn(dico.tRaw("avatarDeleted"), dico.tRaw("avatarDeletedDescription"), true);
            outDeleteAvatarBtn(container, "default-avatar.png");
        } catch (err: any) {
            modal.close();
            confirmModalOneBtn(dico.tRaw("ErrorInDeleteAvatar"), err.message ?? dico.tRaw("failDeleteAvatar"));
        }
    });
}
