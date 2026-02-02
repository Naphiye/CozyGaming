import { ensureKrobusExists } from "./users_file/Krobus.js";
import { ensureHaleyExists } from "./users_file/Haley.js";
import { ensureAbigailExists } from "./users_file/Abigail.js";
import { ensureLewisExists } from "./users_file/Lewis.js";
import { ensureMarnieExists } from "./users_file/Marnie.js";
import { ensureMorrisExists } from "./users_file/Morris.js";
import { ensureMrQiExists } from "./users_file/MrQi.js";
import { ensurePennyExists } from "./users_file/Penny.js";
import { ensureWizardExists } from "./users_file/Wizard.js";
import { ensureLeahExists } from "./users_file/Leah.js";
import { ensureAdminExists } from "./users_file/default_user.js";

export async function createAllDefaultsUsers() {
    await ensureAdminExists();
    await ensureAbigailExists();
    await ensureHaleyExists();
    await ensureKrobusExists();
    await ensureLeahExists();
    await ensureLewisExists();
    await ensureMarnieExists();
    await ensureMorrisExists();
    await ensureMrQiExists();
    await ensurePennyExists();
    await ensureWizardExists();
}