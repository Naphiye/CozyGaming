import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import fs from "fs";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static"; //permet de rendre le dossier accessible au navigateur
import rateLimit from "@fastify/rate-limit";
import fastifyMultipart from "@fastify/multipart"; //comprendre + traiter les fichiers FormData
import websocket from "@fastify/websocket";
import bcrypt from "bcrypt";
// pour load le .env
import dotenv from "dotenv";

import { dico } from '../dico/larousse.js';
import { db } from './sqlite/db.js';
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import nodemailer from "nodemailer";

export const fastify: FastifyInstance = Fastify({
    logger: false,
    https: {
        key: fs.readFileSync("./config/certs/selfsigned.key"),
        cert: fs.readFileSync("./config/certs/selfsigned.crt"),
    },
});

export const uploadsPath = "/backend/uploads"; //chemin absolu vers le dossier dans le docker

export const isProd = process.env.NODE_ENV === "production";
export let emailSender: any = null;
export let fakeHash: string = "";

function verifySecrets() {
    if (!process.env.GITHUB_CLIENT_ID) {
        throw new Error("GITHUB_CLIENT_ID is not defined in environment variables");
    }
    if (!process.env.GITHUB_CLIENT_SECRET) {
        throw new Error("GITHUB_CLIENT_SECRET is not defined in environment variables");
    }
    if (!process.env.UNIVERSAL_PASSWORD) {
        throw new Error("UNIVERSAL_PASSWORD is not defined in environment variables");
    }
    if (!process.env.GMAIL_APP_PASSWORD) {
        throw new Error("GMAIL_APP_PASSWORD is not defined in environment variables");
    }
    if (!process.env.GITHUB_URL) {
        throw new Error("GITHUB_URL is not defined in environment variables");
    }

}
async function initFakeHash() {
    if (!process.env.FAKE_PASSWORD) {
        throw new Error("FAKE_PASSWORD is not defined in environment variables");
    }
    fakeHash = await bcrypt.hash(process.env.FAKE_PASSWORD, 10);
}


export async function registerFastify() {
    dotenv.config();

    verifySecrets();
    if (isProd) {
        migrate(db, { migrationsFolder: "./drizzle" });
    }
    await initFakeHash();
    // Configure Nodemailer
    emailSender = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "transcencapy@gmail.com",
            pass: process.env.GMAIL_APP_PASSWORD, // mot de passe généré par Google
        },
    });

    if (!process.env.LOCALHOST) {
        throw new Error("URL is not defined in environment variables");
    }
    fastify.register(fastifyCors, {
        origin: process.env.LOCALHOST,
        credentials: true
    });

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    fastify.register(fastifyJwt, {
        secret: process.env.JWT_SECRET,
        cookie: {
            cookieName: "token",
            signed: true,
        }
    });

    fastify.register(fastifyCookie);
    fastify.register(fastifyStatic, {
        root: uploadsPath, //chemin pour le serveur
        prefix: "/uploads/", //l'url que le navigateur peut voir
    });

    await fastify.register(websocket);

    await fastify.register(rateLimit, {
        max: 350,                // nombre max de requêtes
        timeWindow: '1 minute',  // fenêtre de temps
        keyGenerator: (req) => req.ip, // 100 requete par ip, de base cest fixe a chaque navigateur
        // ban: 2,                  // optionnel : ban temporaire après X violations

        errorResponseBuilder: (req, context) => {
            const retryAfter =
                typeof context.after === "number"
                    ? context.after
                    : parseInt(context.after ?? "0", 10);
            return {
                statusCode: 429,
                message: `${dico.t("tooManyRequests")} : ${retryAfter} ${dico.t("seconds")}.`,
            };
        },
    });

    fastify.register(fastifyMultipart, {
        limits: {
            fileSize: 2 * 1024 * 1024, //2Mo max
            files: 1,
        }
    });
}

