import { z } from "zod";
import { dico } from "../../dico/larousse.ts";

export function makeMailSchema() {
    return z
        .string()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: dico.tRaw("emailInvalid") });
}

export function makePasswordSchema() {
    return z.string()
        .min(6, { message: dico.tRaw("passwordTooShort") })
        .max(128, { message: dico.tRaw("passwordTooLong") })
        .regex(/[a-z]/, { message: dico.tRaw("passwordNoLowercase") })   // au moins une minuscule
        .regex(/[A-Z]/, { message: dico.tRaw("passwordNoUppercase") })   // au moins une majuscule
        .regex(/[0-9]/, { message: dico.tRaw("passwordNoDigit") })       // au moins un chiffre
        .regex(/[*()&%$#@!+\-=~]/, { message: dico.tRaw("passwordNoSpecial") }); // au moins un spécial
}

export function makeUsernameSchema() {
    return z.string()
        // .min(1, dico.tRaw("usernameTooShort"))
        .min(4, { message: dico.tRaw("usernameTooShort") })
        .max(30, { message: dico.tRaw("usernameTooLong") })
        .refine(value => /^(?=.*\p{L})/u.test(value), {
            message: dico.tRaw("usernameMustContainLetter"),
        })
        .refine(value => /^[\p{L}\p{N}_-]+$/u.test(value), {
            message: dico.tRaw("usernameContainsInvalidChars"),
        });
    // La première refine vérifie qu’il y a au moins une lettre (Unicode, donc inclut lettres chinoises, cyrilliques, etc.).
    // La deuxième refine vérifie que tous les caractères sont autorisés, sinon on renvoie un message spécifique.
}