import type { blocType } from "../../FriendsPage";
import { dico } from "../../../../dico/larousse";
import { EmptyModal } from "../../../modal/EmptyModal";
import { confirmFormTwoBtn } from "../../../DOM_helper";

export type BtnOptions = {
    containerBlock: blocType;
    updateSection: (
        container: HTMLDivElement,
        allUsersBloc: blocType,
        pendingFriendsBloc: blocType,
        myFriendsBloc: blocType,
        blockedFriendsBloc: blocType
    ) => void;
    container: HTMLDivElement;
    allUsersBloc: blocType;
    pendingFriendsBloc: blocType;
    myFriendsBloc: blocType;
    blockedFriendsBloc: blocType;
};


export type trad = {
    titleForm: string,
    contentForm: string,
    actionBtn: string,
    noActionBtn: string
}

export async function confirmFriendActionForm(userLooked: { username: string, id: number },
    options: BtnOptions,
    trad: trad,
    fn: (options: BtnOptions, id: number) => Promise<void>,) {
    const form = document.createElement('div');

    form.innerHTML = confirmFormTwoBtn(trad, userLooked.username);

    // Création du modal
    const modal = EmptyModal({
        title: dico.t(trad.titleForm),
        children: form
    });

    const actionBtn = modal.querySelector<HTMLButtonElement>("#actionBtn");
    const noActionBtn = modal.querySelector<HTMLButtonElement>("#noActionBtn");

    if (!actionBtn || !noActionBtn) {
        console.error("missing content for confirmFriendActionForm");
        return;
    }

    noActionBtn.addEventListener("click", async () => {
        modal.close();
    });

    actionBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        try {
            await fn(options, userLooked.id);
            modal.close();
        } catch (err: any) {
            form.innerHTML = err.message;
        }
    });
}