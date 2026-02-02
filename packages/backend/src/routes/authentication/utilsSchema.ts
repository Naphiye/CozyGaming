import { z } from "zod";

export function makeMailSchema(t: (key: string) => string) {
    return z
        .string()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: t("emailInvalid") });
}
