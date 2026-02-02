import fr from "./fr.ts";
import en from "./en.ts";
import cn from "./cn.ts";

/*
Bienvenue sur le DICO MAISON du FRONT
Ici ca cree notre base de dico ensuite il faut limporter, ya juste a remplir les files des dico

- cette ligne est a mettre sous chaques pages pour que le dico puisse interpreter l'ui
  dico.setLanguage(dico.getLanguage());

- Pour pouvoir implementer une traduction on ecrit dans le html
    ${dico.t("blablabla")}
- exemple:
    <button id="signupBtn" class="classicBtn">${dico.t("SignUp")}</button>
    
le dico genere un code html avec span et data-dico ensuite ils sont automatiquement remplacer par la bonne traduction

pour les PLACEHOLDER: ${dico.tRaw("blablabla")}
<input id="signupLogin" type="text" placeholder="${dico.tRaw("EnterLogin")}" class="border p-2 w-full"/>

*/

type Dictionary = Record<string, string>;
type Translations = { [lang: string]: Dictionary };

class DicoMaison {
    private translations: Translations = {};
    private currentLang: string;

    constructor(defaultLang: string) {
        this.currentLang = defaultLang;
    }

    addLanguage(lang: string, dict: Dictionary) {
        this.translations[lang] = dict;
    }

    setLanguage(lang: string) {
        this.currentLang = lang;
        this.updateUI();
    }

    getLanguage(): string {
        return this.currentLang;
    }

    t(key: string): string {
        return `<span data-dico="${key}">${this.translations[this.currentLang]?.[key] || key}</span>`;;
    }

    tRaw(key: string): string {
        return this.translations[this.currentLang]?.[key] || key;
    }

    private updateUI() {
        document.querySelectorAll<HTMLElement>("[data-dico]").forEach(el => {
            const key = el.dataset.dico!;
            el.textContent = this.tRaw(key);
        });
    }
}

export const dico = new DicoMaison("fr");

dico.addLanguage("fr", fr);
dico.addLanguage("en", en);
dico.addLanguage("cn", cn);