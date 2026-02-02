import { dico } from "../../dico/larousse.ts";
import { loadPage, seePublicProfileEye } from "../DOM_helper.ts";
import { updateEmailModal, UpdatePasswordModal, setTheLang, updateUsernameModal } from "./utils/updateModals.ts";
import { deleteAccountBtn } from "./utils/deleteAccountBtn.ts";
import { setAvatar } from "./avatar/setAvatar.ts";
import { navigate } from "../../router.ts";
import { navbar } from "../utils/navbar/navbar.ts";
import { twoFAhandler } from "./2FAhandler/twoFAhandler.ts";
import { fetchUserMe } from "./utils/fetch.ts";
import { outBtn, outDeleteAvatarBtn, outLangBtn, outPen } from "./utils/outBtnHtml.ts";

function cropModal() {
    return `
<div
    class="flex flex-col justify-center items-center px-4 py-3 cursor-default bg-[#FAD2CB] shadow-xs rounded-3xl w-full">
    <form id="avatarForm" enctype="multipart/form-data" class="flex flex-col items-center">
        <label for="avatarInput" class="activateBtn text-center">${dico.t("selectAvatar")} </label>
        <input id="avatarInput" type="file" class="hidden" name="avatar"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/bmp" />
        <div id="avatarDeleteBtnPlace"></div>
        <p id="modifyAvatarError" class="text-red-500 text-[18px]"></p>
    </form>
</div>

<!-- CROP ZONE MODAL -->
<div id="cropZone" class="hidden fixed inset-0 z-50 flex items-center justify-center 
    backdrop-blur-sm bg-black/40 p-4">
    <div class="min-w-[400px] max-w-[800px] bg-white p-6 rounded shadow flex flex-col relative">
        <!-- Image -->
        <div class="flex-1 flex items-center justify-center mb-4">
            <img id="cropImage" class="max-w-full max-h-full object-contain rounded" />
        </div>

        <!-- Buttons -->
        <div class="flex gap-4 justify-center">
            <button id="cropValidateBtn" class="smallLogBtn flex-1">${dico.t("sendCropAvatar")}</button>
            <button id="cropCancelBtn" class="deactivateBtn flex-1">${dico.t("cancel")}</button>
        </div>
    </div>
</div>`;
}

export async function ProfilePage(container: HTMLDivElement) {
    const footer = document.querySelector<HTMLDivElement>("footer");
    if (!footer) {
        console.error("Footer not found in DashboardPage");
        return;
    }
    footer.style.display = "none";
    loadPage(container);
    let user: any;
    try {
        user = await fetchUserMe();
    } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/");
        return;
    }
    if (!user) return;

    const { id, username, email, avatar, isOAuth, twoFA } = user;
    container.innerHTML = `
    <div class="containerAllInCenter animateFade">
        <div class="relative p-[70px] pb-[100px] pt-20 w-[1150px] my-[100px] mt-[100px] ">
            <div class="absolute inset-0 bg-[rgba(255,246,239,0.9)] blur-lg rounded-[90px] -z-10"></div>

            <div class="flex flex-nowrap place-content-center items-center gap-x-[50px] mb-[60px]">
                <h1 class="titlePage pr-[35px] pl-[35px] p-[15px] min-w-fit">${dico.t("MyProfile")}</h1>
                <div id="navbar"></div>
            </div>

            <div class=" flex justify-center">
                <div class="bgUsers p-[30px] pr-10 pl-10 flex flex-col items-center max-w-fit">

                    <span class="flex items-center titleFriends px-5  mb-7 text-[45px]">
                        <span id="usernamePlace">${username}</span>
                        ${seePublicProfileEye()}
                        ${outPen("modifyUsernameBtn", "modifyUsername")}
                    </span>

                    <div class="flex items-center gap-x-[35px]">
                        <div class="bgAvatar p-5 w-[250px] h-fit">
                            <img id="avatarImg" src="/api/uploads/${avatar}?v=${Date.now()}"
                                class="h-[210px] object-cover rounded-4xl border-2 border-[#ac7879] mb-5"
                                alt="avatar" />
                            ${cropModal()}
                        </div>
                        <div class="flex flex-col justify-center items-center w-[600px]">
                            <div class="statsBloc">
                                <h2 class="statsTitle cursor-default">
                                    ${dico.t("myPersonnalInfo")}
                                </h2>

                                <div class="statsLine w-full">
                                    ${outBtn(isOAuth, "myPassword", "cannotModifyPasswordOrEmailOAuth",
        "modifyPasswordBtn", "modifyPassword")}
                                </div>
                                <div class="statsLine w-full">
                                    ${outBtn(isOAuth, "myEmail", "cannotModifyPasswordOrEmailOAuth", "modifyMailBtn",
            "modifyMail", email)}
                                </div>
                                <div class="statsLine w-full">
                                    ${outLangBtn()}
                                </div>
                            </div>

                            <div class="statsBloc mt-3">

                                <div class="flex gap-x-5">
                                    <div class="statsLineCenter min-w-[301px]">
                                        <div class="flex flex-col text-center">
                                            <span class="font-bold leading-7 mb-2">${dico.t("userFAStatus")}
                                            <div id="twoFAStatusId" class="font-normal italic"></div></span>
                                            <div class="flex justify-center">
                                                <button id="twoFABtn"></button>
                                            </div>
                                        </div>

                                    </div>
                                    <div class="statsLineCenter min-w-[247px]">
                                        <button id="deleteUserBtn"
                                            class="deactivateBtn">${dico.t("deleteUser")}</button>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </div>`;

    footer.style.display = "block";

    navbar(container, "profileBtn");
    const profileBtn = container.querySelector<HTMLButtonElement>("#seePublicProfileBtn");
    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            const usernamePlace = container.querySelector<HTMLSpanElement>("#usernamePlace");
            const username = usernamePlace?.textContent?.trim() ?? "";
            navigate(`/profile/${encodeURIComponent(username)}`);
        });
    }
    setTheLang(container);
    const modifyUsername = container.querySelector<HTMLButtonElement>("#modifyUsernameBtn");
    const modifyPassword = container.querySelector<HTMLButtonElement>("#modifyPasswordBtn");
    const modifyMail = container.querySelector<HTMLButtonElement>("#modifyMailBtn");

    if (!modifyUsername) {
        console.error("missing content in profile - modifyUsernameBtn");
        return;
    }
    modifyUsername.addEventListener("click", () => {
        updateUsernameModal(container);
    });
    if (modifyPassword && modifyMail) {
        modifyPassword.addEventListener("click", () => {
            UpdatePasswordModal(container);
        });

        modifyMail.addEventListener("click", () => {
            updateEmailModal(container);
        });
    }
    outDeleteAvatarBtn(container, avatar);

    ////////// CONCERNE LE BOUTON 2FA
    // ATTENTION ca fonctionne aussi grace au user en haut de la page
    // need <button id="twoFABtn"></button> pour fonctionner
    twoFAhandler(container, twoFA);

    setAvatar(container);
    deleteAccountBtn(container, { id, username });
}
