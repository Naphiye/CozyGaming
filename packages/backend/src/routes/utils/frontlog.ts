import { fastify } from "../../server_config/server_setup.js";
import type { FastifyRequest, FastifyReply } from 'fastify';
import fs from "fs/promises";
import path from "path";



export async function frontend_log(){
	// POST /log/front
	fastify.post('/log/front', { config: { rateLimit: { max: 200, timeWindow: '1 minute' } } },
		async (request: FastifyRequest, reply: FastifyReply) => {

			try {
				const body = request.body as {
					level?: string;
					message?: string;
					timestamp?: string;
				};

				// --- VALIDATION DU BODY ---
				if (!body || !body.message || !body.timestamp || !body.level) {
					return reply.code(400).send({ error: "invalid_log_data" });
				}

				// --- CONSTRUCTION DU TEXTE FINAL ---
				const line =
					`[${body.timestamp}] [${body.level}] ${body.message}\n`;

				// --- EMPLACEMENT DU FICHIER ---
				const logDir = path.join(process.cwd(), "logs");
				// Vérifie si le dossier existe
				const dirExists = await fs
					.access(logDir)
					.then(() => true)
					.catch(() => false);

				if (!dirExists) {
					await fs.mkdir(logDir); // créer le dossier uniquement s'il n'existe pas
				}


				const logFilePath = path.join(logDir, "frontend.log");

				// --- ÉCRITURE DANS LE FICHIER ---
				await fs.appendFile(logFilePath, line, "utf8");
				// --- RÉPONSE ---
				return reply.code(200).send({ success: true });

			} catch (error: any) {
				console.error("Error /log/front :", error);
				return reply.code(500).send({ error: "server_error" });
			}
		});
}


