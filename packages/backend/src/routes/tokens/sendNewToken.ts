import crypto from "node:crypto";
import type { FastifyReply } from 'fastify';

import { fastify } from "../../server_config/server_setup.js"

import { accessTokens } from "../../server_config/sqlite/schema.js";
import { db } from "../../server_config/sqlite/db.js";
import "../../dico/larousse.js"


const ACCESS_TIME = 60 * 60 * 24 * 2; // 60 60 = 1h * 24 = 1jour * 2 = 2jours // check a voir si on change le temps

export async function sendNewToken(reply: FastifyReply, userId: number) {
    const { accessToken } = await tokenCreation(userId);
    sendToken(reply, accessToken);
}

async function tokenCreation(id: number) {
    const accessToken = fastify.jwt.sign({ id: id }, { expiresIn: ACCESS_TIME });

    const expiresHot = new Date(Date.now() + ACCESS_TIME * 1000);

    const accessHash = crypto.createHash("sha256").update(accessToken).digest("hex");

    await db.insert(accessTokens).values({
        userId: id,
        tokenHash: accessHash,
        expiresAt: expiresHot.toISOString(),
    });
    return { accessToken };
}

function sendToken(reply: FastifyReply, accessToken: string) {
    reply.setCookie("access", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: ACCESS_TIME, // doit correspondre a expire in du token creation
    });
}

