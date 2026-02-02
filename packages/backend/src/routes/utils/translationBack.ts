import type { FastifyRequest } from "fastify";
import { dico } from "../../dico/larousse.js";

// Fonction utilitaire pour traduire dans le back avec la langue selectionnee au front

export function translate(request: FastifyRequest) {
    // récupère le header Accept-Language
    const langHeader = request.headers["accept-language"];
    const lang = dico.detectLanguage(langHeader as string);
    return (key: string) => dico.t(key, lang);
}
