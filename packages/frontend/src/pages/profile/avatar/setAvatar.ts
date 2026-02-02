import { fetchUpdateAvatar } from "../utils/fetch.ts";
import { dico } from "../../../dico/larousse.ts";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { confirmModalOneBtn } from "../../DOM_helper.ts";
import { outDeleteAvatarBtn } from "../utils/outBtnHtml.ts";




// AVATAR MAIN FUNCTION *********************
export function setAvatar(container: HTMLDivElement) {
    const input = container.querySelector("#avatarInput") as HTMLInputElement;
    // const imageName = container.querySelector("#fileName") as HTMLSpanElement;
    const avatarImg = container.querySelector("#avatarImg") as HTMLImageElement;


    if (!input) {
        console.error("missing content for avatar upload");
        return;
    }

    input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;

        // imageName.textContent = file.name;

        // ——— 1) Validation FILE avant crop ———
        const fileCheck = await validateFileBeforeCrop(file);
        if (!fileCheck.ok) {
            input.value = "";
            if (fileCheck.message) {
                confirmModalOneBtn(dico.tRaw("ErrorInModifyAvatar"), fileCheck.message)
            }
            return;
        }
        // ——— 2) Crop obligatoire ———
        const cropResult = await openAvatarCropper(container, file);

        if (!cropResult.file) {
            input.value = "";
            confirmModalOneBtn(dico.tRaw("ErrorInModifyAvatar"), dico.tRaw("uploadCancel"))
            return;
        }

        const croppedBlob = cropResult.file;

        // ——— 3) Validation du blob recroppé ———
        const blobCheck = validateCroppedBlob(croppedBlob);
        if (!blobCheck.ok) {
            if (blobCheck.message) {
                confirmModalOneBtn(dico.tRaw("ErrorInModifyAvatar"), blobCheck.message)
            }
            return;
        }

        // ——— 4) Build formData ———
        const formData = buildAvatarFormData(croppedBlob);

        // ——— 5) Upload ———
        try {
            const response = await fetchUpdateAvatar(formData);
            avatarImg.src = `${response.avatarPath}?v=${Date.now()}`;
            confirmModalOneBtn(dico.tRaw("updateAvatarSuccess"), dico.tRaw("avatarUpdate"), true)
            outDeleteAvatarBtn(container, response.avatarPath);
        } catch (err: any) {
            confirmModalOneBtn(dico.tRaw("ErrorInModifyAvatar"), err.message ?? dico.tRaw("failAvatar"))
        }
    });
}



// AVATAR CHECK FUNCTIONS *********************
function checkImageSize(file: File, minWidth = 10, minHeight = 10): Promise<boolean> {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            resolve(img.width >= minWidth && img.height >= minHeight);
        };
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
    });
}

async function validateFileBeforeCrop(file: File): Promise<{ ok: boolean; message?: string | undefined; }> {
    const maxSizeBeforeCrop = 20 * 1024 * 1024; // 20 MB
    const allowedMime = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/bmp"];

    if (file.size > maxSizeBeforeCrop) {
        return { ok: false, message: dico.tRaw("imageTooHeavy") };
    }

    if (!allowedMime.includes(file.type)) {
        return { ok: false, message: dico.tRaw("onlyImageFiles") };
    }
    if (!(await checkImageSize(file))) {
        return { ok: false, message: dico.tRaw("imageTooSmall") };
    }
    return { ok: true };
}

function validateCroppedBlob(blob: Blob): { ok: boolean; message?: string } {
    const maxSizeAfterCrop = 2 * 1024 * 1024; // 2MB

    if (!blob.type.startsWith("image/")) {
        return { ok: false, message: dico.tRaw("onlyImageFiles") };
    }

    if (blob.size > maxSizeAfterCrop) {
        return { ok: false, message: dico.tRaw("imageTooHeavy") };
    }

    return { ok: true };
}



// BUILD FORM DATA FUNCTION *********************

function buildAvatarFormData(blob: Blob): FormData {
    const form = new FormData();
    form.append("avatar", blob);
    return form;
}




// CROPPPER JS TYPES AND FUNCTIONS *********************

// type CropperResult = {
// 	file: File | null;
// 	reason: "validate" | "cancel" | "close";
// };

async function openAvatarCropper(container: HTMLDivElement, file: File): Promise<{ file: File | null }> {
    const cropZone = container.querySelector("#cropZone") as HTMLDivElement;
    const imgElem = container.querySelector("#cropImage") as HTMLImageElement;
    const validateBtn = container.querySelector("#cropValidateBtn") as HTMLButtonElement;
    const cancelBtn = container.querySelector("#cropCancelBtn") as HTMLButtonElement;
    if (!cropZone || !imgElem || !validateBtn || !cancelBtn) {
        return { file: null };
    }

    const url = URL.createObjectURL(file);
    imgElem.src = url;
    cropZone.classList.remove("hidden");

    const cropper = new Cropper(imgElem, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: "move",
        zoomable: true,
        scalable: false,
        background: false
    });

    return new Promise(resolve => {
        const cleanUp = () => {
            cropper.destroy();
            cropZone.classList.add("hidden");
            URL.revokeObjectURL(url);
        };

        validateBtn.onclick = () => {
            cropper.getCroppedCanvas().toBlob((blob: Blob | null) => {
                cleanUp();
                if (blob) {
                    const extension = file.type.split("/")[1];
                    const baseName = file.name.replace(/\.[^/.]+$/, "");
                    const croppedFile = new File([blob], `${baseName}.${extension}`, { type: file.type });
                    resolve({ file: croppedFile });
                } else {
                    resolve({ file: null });
                }
            }, file.type);
        };

        cancelBtn.onclick = () => {
            cleanUp();
            resolve({ file: null });
        };
    });
}



