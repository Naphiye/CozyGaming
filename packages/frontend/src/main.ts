import { auth } from "./authentication/auth";
import { updateRoute } from "./router"
import { logIntoFile } from "./logger.ts";


window.addEventListener("popstate", updateRoute);

auth.subscribe(() => updateRoute());

logIntoFile();
await updateRoute();