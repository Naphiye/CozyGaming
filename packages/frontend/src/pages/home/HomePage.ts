import { fetchLoginResendMailFACode, LoginModal } from "./logIn.ts";
import { dico } from "../../dico/larousse.ts";
import { loadPage, confirmModalOneBtn } from "../DOM_helper.ts";
import { EmailCooldownManager } from "../profile/2FAhandler/utils/EmailCooldownManager.ts";
import { fetchVerifyFACode } from "../profile/2FAhandler/utils/fetch2FA.ts";
import { handleTwoFACodeForm, type TwoFAOptions } from "../profile/2FAhandler/utils/handleTwoFACodeForm.ts";
import { EmptyModal } from "../modal/EmptyModal.ts";
import { auth } from "../../authentication/auth.ts";
import { navigate } from "../../router.ts";
import { unlockEveryClickInModal } from "../profile/2FAhandler/twoFAhandler.ts";
import { loadingForm } from "../profile/2FAhandler/utils/different_form.ts";

export function handleOauthError() {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("oauth_error");

    if (!error) return;

    // Affiche ton modal
    confirmModalOneBtn(
        "Erreur de connexion",
        decodeURIComponent(error),
        false
    );

    // Nettoie l'URL pour éviter que le modal revienne au refresh
    window.history.replaceState({}, "", window.location.pathname);
}


function fetchAuthGithub() {
    if (window.location.href.includes("localhost:5173")) {
        window.location.href = "https://localhost:5173/api/auth/github";
    }
    else {
        window.location.href = "https://localhost:8443/api/auth/github";
    }
}


function setupGithubBtn(container: HTMLDivElement) {

    const btn = container.querySelector("#githubBtn");
    if (!btn) return console.error("Github button is missing"); // si le bouton n'existe pas, on quitte
    btn.addEventListener("click", fetchAuthGithub);
}

function setupLangBtn(container: HTMLDivElement, lang: string, selector: string, titleEl: HTMLElement, toAnimate: string) {
    const btn = container.querySelector(selector);
    if (!btn) return console.error(selector, " is missing"); // si le bouton n'existe pas, on quitte
    btn.addEventListener("click", () => {
        dico.setLanguage(lang);
        animateTitle(titleEl, dico.tRaw(toAnimate));
        localStorage.setItem("lang", lang);
    });
}

function langsBtn(container: HTMLDivElement, titleEl: HTMLElement, toAnimate: string) {
    setupLangBtn(container, "fr", "#langFr", titleEl, toAnimate);
    setupLangBtn(container, "en", "#langEn", titleEl, toAnimate);
    setupLangBtn(container, "cn", "#langCn", titleEl, toAnimate);
}


function animateTitle(titleEl: HTMLElement, text: string) {
    // coupe en mot
    const words = text.split(" ");
    // coupe les mots en lettres et ajoute le span avec delay
    const wordsletter = words.map((word) => {
        const separate = word
            .split("")
            .map(
                (letter, i) =>
                    `<span class="titleWave" style="animation-delay: ${i * 0.1
                    }s">${letter}</span>`
            );
        return separate;
    });
    // remet les lettres ensemble
    const wordstogetherback = wordsletter.map((word) => word.join(""));
    // remet les mots ensemble
    const wordstogetherbackAll = wordstogetherback.join(" ");
    // injecte dans le DOM
    titleEl.innerHTML = wordstogetherbackAll;
}

export async function HomePage(container: HTMLDivElement) {
    const footer = document.querySelector<HTMLElement>("footer");
    if (footer) {
        footer.style.display = "block";
    }
    loadPage(container);
    handleOauthError();
    /* DETECTEUR POUR LOUVERTURE DU MODAL 2FA SI ON EST UNE REDIRECTION DE GITHUB */
    let user: { id: number, username: string, lang: string } | null = null;
    const urlParams = new URLSearchParams(window.location.search);
    history.pushState({}, "", "/");
    if (urlParams.size > 0) {
        const token = urlParams.get("token");
        if (token === null) {
            return;
        }
        try {
            user = await fetchVerifyTokenFA(token);
        }
        catch {
            console.error("Error verifying GitHub 2FA token");
        }
    }

    container.innerHTML = `
    <div class="containerAllInCenter animateFade">
        <div class="relative p-[70px] w-[1150px] my-[100px] mt-[100px] ">
            <div class="absolute inset-0 bg-[rgba(250,210,203,0.9)] blur-lg rounded-[90px] -z-10"></div>
            <!-- TITLE -->
            <div class="titlePage p-[35px]">
                <h1 id="title" class=""></h1>
            </div>

            <!-- LOGIN / SIGN-IN BUTTON -->
            <div class="flex flex-wrap p-[50px] justify-around">

                <button id="loginBtn" class="bigLogBtn">
                    ${dico.t("SignInLoginOrEmail")}
                </button>
                <button id="githubBtn" class="bigLogBtn">
                    <span class="flex flex-col items-center">
                        ${dico.t("loginWith")}
                        <span class="flex items-center">${dico.t("Github")}
                            <img src="/assets/github.png"
                                class="brightness-160 w-13 h-13 ml-2 transition duration-250 ease-in-out" />
                        </span>
                    </span>
                </button>

            </div>

            <!-- LANG BUTTON -->
            <div class="flex flex-wrap justify-around">

                <!-- FR BUTTON -->
                <button id="langFr" class="langBtn">
                    <img src="/assets/lang/capyFR.png" alt="flag_fr" class="w-24" />
                    <p class="">Français</p>
                </button>
                <!-- EN BUTTON -->
                <button id="langEn" class="langBtn">
                    <img src="/assets/lang/capyUK.png" alt="flag_uk" class="w-24" />
                    <p class="">English</p>
                </button>
                <!-- CN BUTTON -->
                <button id="langCn" class="langBtn">
                    <img src="/assets/lang/capyCN.png" alt="flag_cn" class="w-24" />
                    <p class="">中文</p>
                </button>

            </div>

        </div>
    </div>
    `;

    const titleEl = container.querySelector<HTMLElement>("#title");
    const loginEL = container.querySelector<HTMLElement>("#loginBtn");
    if (!titleEl || !loginEL) {
        console.error("missing title in homepage");
        return;
    }
    //////////////////////
    // animer le titre
    animateTitle(titleEl, dico.tRaw("welcome"));
    //////////////////////

    langsBtn(container, titleEl, "welcome");

    loginEL.addEventListener("click", async () => {
        LoginModal(container);
    });

    setupGithubBtn(container);

    /* OUVERTURE DU MODAL 2FA SI ON EST UNE REDIRECTION DE GITHUB OU DU 2FA LOGIN */
    if (user) {
        const form = document.createElement('div');
        form.innerHTML = loadingForm();
        const modal = EmptyModal({
            title: dico.t("SignInTwoFA"),
            children: form,
            onClose: () => {
                container.style.pointerEvents = "auto";
            }
        });
        EmailCooldownManager.addStorage();
        const TwoFAOptions: TwoFAOptions = {
            container: container,
            modal: modal,
            form: form,
            loginUser: { id: user.id, lang: user.lang },
            onCloseExtra: () => { EmailCooldownManager.removeStorage() },
            fetchResendEmail: async () => { await fetchLoginResendMailFACode(user.username) },
            fetchVerifyFACode: async (id: number, code: string) => { await fetchVerifyFACode(id, code, false) },
            codeSuccess: () => {
                modal.close(); // fermer le modal si cest bon.
                dico.setLanguage(user.lang); // charger la langue avec lequel user sest inscrit
                localStorage.removeItem("lang");
                auth.setUser(true, false); // maj auth on navigate pas car le auth est subscribe a updateroute
                navigate("/");
            },
            onFinnalyCode: () => {
                unlockEveryClickInModal(container, modal);
            }
        }
        // ouvrir le modal
        handleTwoFACodeForm(TwoFAOptions);
    }
}

async function fetchVerifyTokenFA(token: string) {
    const lang = dico.getLanguage();
    const res = await fetch("/api/auth/2fa/verifytoken", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": lang,
        },
        body: JSON.stringify({ token }),
    });
    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.error || dico.tRaw("unknownError")); // data.error vient du back
    }
    return data.user;
}