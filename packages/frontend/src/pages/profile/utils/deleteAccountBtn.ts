import { auth, ws } from "../../../authentication/auth";
import { dico } from "../../../dico/larousse";
import { navigate } from "../../../router";
import { EmptyModal } from "../../modal/EmptyModal";
import type { trad } from "../../friends/utils/btnHandler/formConfirm";
import { confirmFormTwoBtn, confirmModalOneBtn } from "../../DOM_helper";
import { lockEveryClickInModal, unlockEveryClickInModal } from "../2FAhandler/twoFAhandler";

async function fetchDeleteUser() {
    const lang = dico.getLanguage();
    const res = await fetch("/api/users/me/delete", {
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
        throw new Error(data.error || dico.tRaw("unknownError")); // data.error vient du back
    }
}

export function deleteAccountBtn(container: HTMLDivElement, user: {id: number, username: string}) {
    const deleteUserBtn = container.querySelector<HTMLButtonElement>("#deleteUserBtn");
    if (!deleteUserBtn) {
        return;
    }
    deleteUserBtn.addEventListener("click", async () => {

        const trad: trad = {
            titleForm: "deleteUser",
            contentForm: "deleteAccountConfirmation",
            actionBtn: "delete",
            noActionBtn: "keepMyAccount"
        }
        const form = document.createElement("div");

        form.innerHTML = confirmFormTwoBtn(trad);

        const modal = EmptyModal({
            title: dico.t(trad.titleForm),
            children: form,
        });
        const noActionBtn = modal.querySelector<HTMLButtonElement>("#noActionBtn");
        const actionBtn = modal.querySelector<HTMLButtonElement>("#actionBtn");
        if (!noActionBtn || !actionBtn) {
            console.error("missing content in deleteaccount");
            return;
        }

        noActionBtn.addEventListener("click", () => {
            modal.close();
        });
        actionBtn.addEventListener("click", async (event) => {
            event.preventDefault();
            lockEveryClickInModal(container, modal);
            try {
                modal.close();
                await fetchDeleteUser();
                if (ws && ws.readyState === WebSocket.OPEN) {
                    const data = { state: "deleteAccount", id: user.id, username: user.username };
                    ws.send(JSON.stringify(data));
                }
                auth.setUser(false, false);
                navigate("/");
            } catch (err: any) {
                confirmModalOneBtn(dico.tRaw("ErrorInDeleteUser"), err.message);
            } finally {
                unlockEveryClickInModal(container, modal);
            }
        });
    });
}
