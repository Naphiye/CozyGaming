import { navigate } from "../../../router.ts";

export async function safeFetch<T>(fn: () => Promise<T>, redirectPath: string, errorMsg: string): Promise<T | null> {
    try {
        return await fn();
    } catch (err) {
        console.error(errorMsg, err);
        navigate(redirectPath);
        return null;
    }
}
