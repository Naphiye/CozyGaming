import type { FastifyRequest, FastifyReply } from 'fastify';
import { db } from "../../server_config/sqlite/db.js"
import { users } from "../../server_config/sqlite/schema.js"
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import crypto from "node:crypto";
import { fastify } from "../../server_config/server_setup.js";

import { translate } from '../utils/translationBack.js';
import "../../dico/larousse.js"
import { sendNewToken } from "../tokens/sendNewToken.js";
import { uploadsPath } from "../../server_config/server_setup.js";
import { sendEmailFACode } from "../2fa/sendEmail2FA.js";
import { createRandomTokenTwoFA } from "../2fa/verifyToken2FA.js";

// Typage pour l’utilisateur GitHub
interface GithubUser {
    login: string;
    id: number;
    avatar_url: string;
    email: string | null;
}

// Typage pour l’email GitHub
interface GithubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string | null;
}

async function findOrCreateGithubUser(githubUser: any) {
    // 1️⃣ Chercher par email
    const usersFound = await db.select().from(users).where(eq(users.email, githubUser.email));
    const user = usersFound[0]; // on prend le premier résultat, s'il existe

    // Vérifier si on a trouvé un utilisateur
    if (user) {
        if (!user.isOAuth) {
            throw { code: 400, message: "Un compte avec cet email existe déjà." };
        }

        console.log("Utilisateur OAuth existant trouvé :", user.id);
        return user;
    }

    // 2️⃣ Si pas trouvé, créer un nouvel utilisateur OAuth
    const newUserArray = await db.insert(users).values({
        username: githubUser.login,
        email: githubUser.email,
        passwordHash: "OAUTH",
        lang: "en",
        avatar: "", // on met vide pour l'instant, on mettra le chemin local après download
        twoFA: false,
        isOAuth: true
    }).returning();

    const newUser = newUserArray[0];
    if (!newUser) {
        console.error("❌ Échec de la création de l'utilisateur github pour le nom d'utilisateur : ", githubUser.login);
        throw { code: 500, message: "Erreur lors de la création de l'utilisateur OAuth." };
    }

    // 3️⃣ Télécharger l'avatar GitHub et le stocker localement
    if (githubUser.avatar_url) {
        try {
            const response = await fetch(githubUser.avatar_url);
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const ext = path.extname(githubUser.avatar_url).split("?")[0] || ".png"; // gestion d'URL avec query
                const avatarFileName = `users/${newUser.id}-avatar${ext}`;


                const avatarPath = path.join(uploadsPath, avatarFileName);
                fs.writeFileSync(avatarPath, buffer);

                // 4️⃣ Mettre à jour la DB avec le chemin local
                await db.update(users)
                    .set({ avatar: avatarFileName })
                    .where(eq(users.id, newUser.id));

                newUser.avatar = avatarFileName; // mettre à jour l'objet retourné

                console.log("Avatar GitHub téléchargé et stocké :", avatarFileName);
            }
        } catch (err) {
            console.error("Erreur lors du téléchargement de l'avatar GitHub :", err);
        }
    }

    console.log("Nouvel utilisateur OAuth créé :", newUser);
    return newUser;
}

export function createOauthRoutes() {
    fastify.get('/auth/github', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);
        try {
            const clientId = process.env.GITHUB_CLIENT_ID;
            let redirectUri = process.env.LOCALHOST + `api/auth/github/callback`;

            const state = crypto.randomBytes(512).toString("hex"); // jeton anti-CSRF
            // Stocker dans un cookie HttpOnly
            reply
                .setCookie("oauth_state", state, {
                    httpOnly: true,
                    secure: false, // true en prod avec HTTPS
                    path: "/",
                    maxAge: 300 // 5 minutes par ex.
                });

            const githubAuthUrl = process.env.GITHUB_URL + `login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email&state=${state}`;

            return reply.redirect(githubAuthUrl);

        } catch (error: any) {
            // Si on a lancé notre propre erreur avec code/message
            if (typeof error.code === "number" && error.message) {
                console.error("Error /auth/github/ : code : ", error.code, ", message : ", error.message);
                return reply.code(error.code).send({ error: error.message });
            }
            console.error("Error /auth/github/ : ", error);
            // Erreur inattendue côté serveur
            return reply.code(500).send({ error: t("serverError") });
        }
    });

    //giuthub redirige ici
    fastify.get('/auth/github/callback', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
        const t = translate(request);
        try {
            // on recupere le code et le state dans l'url
            const { code, state } = request.query as { code?: string; state?: string };

            if (!code || !state) {
                return reply.code(400).send({ error: "Missing code or state" });
            }

            // verifier le state avec celui en cookie pour eviter les attaques CSRF
            const storedState = request.cookies.oauth_state;

            if (!storedState || state !== storedState) {
                return reply.code(400).send({ error: "Invalid state" });
            }

            // Supprimer le cookie après vérification
            reply.clearCookie("oauth_state");


            // 1. exchange code for token
            const tokenResponse = await fetch(process.env.GITHUB_URL + "login/oauth/access_token", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code
                })
            });

            const tokenData = (await tokenResponse.json()) as { access_token: string };
            if (!tokenData.access_token) {
                return reply.code(400).send({ error: "Failed to obtain access token" });
            }


            // 2. Fetch user profile
            const userResponse = await fetch(process.env.GITHUB_API + "user", {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    "User-Agent": "fastify-app"
                }
            });


            const githubUser: GithubUser = await userResponse.json() as GithubUser;


            // 2️⃣ Récupérer emails si githubUser.email est null
            let email = githubUser.email;
            if (!email) {
                const emailsRes = await fetch(process.env.GITHUB_API + "user/emails", {
                    headers: { Authorization: `Bearer ${tokenData.access_token}`, "User-Agent": "fastify-app" }
                });
                const emails: GithubEmail[] = await emailsRes.json() as GithubEmail[];
                const primaryEmail = emails.find(e => e.primary && e.verified);
                email = primaryEmail ? primaryEmail.email : null;
            }

            if (!email) {
                throw { code: 400, message: "Impossible de récupérer l'email GitHub" };
            }

            // 3️⃣ On peut maintenant mettre l’email dans githubUser
            githubUser.email = email;

            // 3. Find or create user in our database

            const user = await findOrCreateGithubUser(githubUser);
            if (!user) {
                throw { code: 500, message: "Erreur lors de la création ou de la récupération de l'utilisateur" };
            }

            // 4. Générer et envoyer les tokens
            // si 2fa est activé
            if (user.twoFA) {
                const { token } = await createRandomTokenTwoFA(user.id);
                // envoyer un mail pour le 2fa
                await sendEmailFACode(t, user, true);
                console.log("✅ OAuth 2FA : envoie le token 2FA et email 2FA pour l'user ID : ", user.id);
                const url = process.env.LOCALHOST + `?token=${token}`;
                return reply.redirect(url);
            } else {
                // Token déjà créé
                await sendNewToken(reply, user.id);
                console.log("✅ OAuth sans 2FA : envoie les tokens de connexion pour l'user ID : ", user.id);
                const url = process.env.LOCALHOST ?? "";
                return reply.redirect(url);
            }


        } catch (error: any) {

            let message = "Erreur inconnue";

            // Erreur que tu as lancée toi-même
            if (typeof error.code === "number" && error.message) {
                console.error("Error /auth/github/callback :", error.code, error.message);
                message = error.message;
            } else {
                console.error("Error /auth/github/callback :", error);
            }

            // Encode pour éviter les problèmes dans l'URL
            const safeMessage = encodeURIComponent(message);

            // Rediriger vers le front au lieu d'envoyer du JSON
            const url = process.env.LOCALHOST + `?oauth_error=${safeMessage}`;
            return reply.redirect(url);
        }
    });
}

