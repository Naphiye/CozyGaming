import { auth } from "./auth";
import { navigate } from "../router";

// a virer plus tard finalement
export async function refreshIfNeeded() {
    try {
        console.log("log de token refresh");
        
        const accessRes = await fetch("/api/access_token", { credentials: "include" });
        const res = await accessRes.json();
        if (!accessRes.ok) {
            if (accessRes.status === 498) {
                auth.setUser(false, false);
                navigate("/");
            }
            console.error("error : ", res.error);
        }
        console.log("tout va bien pour refresh token if Needed");
        return true;

    } catch (err: any) {
        console.error("Error : ", err.message);
        return false;
    }
}
