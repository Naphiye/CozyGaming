type ModalProps = {
    title: string;
    children?: HTMLDivElement;
    onClose?: () => void;
};

export function EmptyModal({ title, children, onClose }: ModalProps) {
    // Création du backdrop
    const modalBackdrop = document.createElement("div");
    modalBackdrop.className = "fixed inset-0 bg-black/75 bg-opacity-50 flex items-center justify-center z-50";

    // Création du contenu du modal
    const modal = document.createElement("div");
    modal.className = "bg-[#FFF6EF] pt-2 pl-6 pr-6 pb-6 w-[600px] rounded-xl ";

    modal.innerHTML = `<div class="flex justify-between  pb-2.5 text-[40px] font-bold">
    <h2 class="cursor-default pr-4">${title}</h2>
    <button class="-translate-y-1.5 cursor-pointer hover:text-[#B47A67]">x</button>
    </div>
    `;

    const contentContainer = document.createElement("div");
    contentContainer.className = "flex flex-col gap-2";

    // Ajouter le children si présent
    if (children) {
        contentContainer.appendChild(children);
    }

    modal.appendChild(contentContainer);
    modalBackdrop.appendChild(modal);
    document.body.appendChild(modalBackdrop);

    function close() {
        modalBackdrop.remove();          // Supprime le modal du DOM
        currentOnClose?.();      // Appelle la fonction onClose actuelle (si elle existe)
    }

    let currentOnClose = onClose;
    // Bouton fermer (X)
    const closeBtn = modal.querySelector<HTMLButtonElement>("button")!;
    closeBtn.addEventListener("click", () => {
        close();
    });

    let backdropCloseEnabled = true;
    // Optionnel : fermer en cliquant sur le backdrop
    modalBackdrop.addEventListener("click", (e) => {
        if (!backdropCloseEnabled) {
            return; // désactivé temporairement
        }
        if (e.target === modalBackdrop) {
            close();
        }
    });

    // ✅ expose un petit contrôleur
    return Object.assign(modalBackdrop, {
        close,
        setOnClose: (fn: () => void) => (currentOnClose = fn),
        disableBackdropClose: () => (backdropCloseEnabled = false),
        enableBackdropClose: () => (backdropCloseEnabled = true),
    });
}
