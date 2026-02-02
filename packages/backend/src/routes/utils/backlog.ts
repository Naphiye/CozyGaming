import fs from "fs/promises";
import path from "path";


export async function backend_log(){
	const logDir = path.join(process.cwd(), "logs");
				// Vérifie si le dossier existe
				const dirExists = await fs
					.access(logDir)
					.then(() => true)
					.catch(() => false);

				if (!dirExists) {
					await fs.mkdir(logDir); // créer le dossier uniquement s'il n'existe pas
				}

	// --- Fichier de log backend ---
	const logFilePath = path.join(logDir, "backend.log");

	// --- Fonction utilitaire pour écrire dans le fichier ---
	async function writeToFile(level: string, args: any[]) {
	const line = `[${new Date().toISOString()}] [${level}] ${args.join(" ")}\n`;
		await fs.appendFile(logFilePath, line, "utf8");
	}

	// --- Remplacement des fonctions console ---
	const originalLog = console.log;
	console.log = (...args: any[]) => {
	writeToFile("LOG", args);
	// originalLog(...args); // facultatif, si tu veux encore voir les logs dans le terminal
	};

	const originalWarn = console.warn;
	console.warn = (...args: any[]) => {
	writeToFile("WARN", args);
	// originalWarn(...args);
	};

	const originalError = console.error;
	console.error = (...args: any[]) => {
	writeToFile("ERROR", args);
	// originalError(...args);
	};
}
