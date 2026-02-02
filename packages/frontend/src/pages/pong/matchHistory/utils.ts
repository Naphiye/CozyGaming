import { dico } from "../../../dico/larousse";

/** Regroupe les matchs par mode */
export function groupMatchesByMode(matches: any[]) {
    const grouped = { classic: [], ai: [], tournament: [] } as Record<string, any[]>;
    for (const match of matches) {
        if (grouped[match.mode]) grouped[match.mode].push(match);
    }
    return grouped;
}

/** Formate une date selon la langue */
export function formatDate(timestamp: number) {
    const date = new Date(timestamp * 1000);
    const lang = dico.getLanguage() || 'en';
    const localeMap: Record<string, string> = {
        fr: 'fr-FR',
        zh: 'zh-CN',
    };
    const locale = localeMap[lang] || 'en-US';
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };
    return date.toLocaleString(locale, options);
}


/** Message vide */
export function emptyMessage(key: string) {
    return `
      <p class="empty text-center text-white italic font-bold text-[20px]">
         ${dico.tRaw(key)}
      </p>
   `;
}

