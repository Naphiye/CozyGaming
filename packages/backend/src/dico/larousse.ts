import fr from "./fr.js";
import en from "./en.js";
import cn from "./cn.js";

/*
Bienvenue sur le DICO MAISON du BACK
Ici ca cree notre base de dico ensuite il faut limporter, ya juste a remplir les files des dico

- cette ligne est a mettre sous chaques fonctions pour que le dico puisse interpreter la trad du back
  const t = translate(request);

- Pour pouvoir implementer une traduction on ecrit 
    t("traduction a mettre")

comme avant en fait

*/

type Dictionary = Record<string, string>;
type Translations = { [lang: string]: Dictionary };

export class DicoMaison {
    private translations: Translations = { fr, en, cn };
    private defaultLang = "fr";
    private currentLang: string;


    constructor(defaultLang: string) {
        this.currentLang = defaultLang;
    }

    t(key: string, lang?: string): string {
        const current = lang && this.translations[lang] ? lang : this.defaultLang;
        return (this.translations[current] ?? {})[key] || key;
    }

    myLang() {
        return this.currentLang;
    }

    // détermine la langue à partir de l'en-tête
    detectLanguage(acceptLangHeader?: string): string {
        if (!acceptLangHeader) return this.defaultLang;
        const lang = acceptLangHeader.split(",")[0]?.trim().slice(0, 2) ?? this.defaultLang;
        this.currentLang = lang;
        return this.translations[lang] ? lang : this.defaultLang;
    }
}

export const dico = new DicoMaison("fr");
