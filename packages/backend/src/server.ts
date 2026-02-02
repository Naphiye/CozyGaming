import { fastify, isProd, registerFastify } from "./server_config/server_setup.js";
import { createAllDefaultsUsers } from "./server_config/defaults_users/createAllDefaultsUsers.js";
import { createWebsocketRoute } from "./server_config/websocket/websocket.js";

import { createSendcode2faRoute } from "./routes/2fa/sendCode2FA.js"
import { createCheckcode2faRoute } from "./routes/2fa/checkCode2FA.js"

import { createLoginRoute } from "./routes/authentication/login.js"
import { createLogoutRoute } from "./routes/authentication/logout.js"
import { createRegisterRoute } from "./routes/authentication/register.js"
import { createOauthRoutes } from "./routes/authentication/OAuth.js"

import { createAddfriendsRoute } from "./routes/users/public/friends_list/add_friends.js"
import { createBlockfriendsRoute } from "./routes/users/public/friends_list/block_friends.js"
import { createRemovefriendsRoute } from "./routes/users/public/friends_list/remove_friends.js"
import { createAllUsersRoute } from "./routes/users/public/all_users.js"
import { createOneUserRoute } from "./routes/users/public/one_user.js"

import { createUserMeRoutes } from "./routes/users/me/users.js"
import { createAvatarRoutes } from "./routes/users/me/avatar.js"
import { createUpdateInfoRoutes } from "./routes/users/me/updateInfo.js"

import { createaccessTokensRoute } from "./routes/tokens/refresh.js"
import { createAliasValidationRoute } from "./routes/pong/aliasValidation.js"
import { createMatchHistoryRoutes } from "./routes/pong/matchHistory.js"
import { createVerifyToken2faRoute } from "./routes/2fa/verifyToken2FA.js";

import { frontend_log } from "./routes/utils/frontlog.js";
import { backend_log } from "./routes/utils/backlog.js";

function createRoutes() {
    createWebsocketRoute();
    createSendcode2faRoute();
    createCheckcode2faRoute();
    createVerifyToken2faRoute();
    createLoginRoute();
    createLogoutRoute();
    createRegisterRoute();
    createOauthRoutes();
    createAddfriendsRoute();
    createBlockfriendsRoute();
    createRemovefriendsRoute();
    createAllUsersRoute();
    createOneUserRoute();
    createUserMeRoutes();
    createAvatarRoutes();
    createUpdateInfoRoutes();
    createaccessTokensRoute();
    createAliasValidationRoute();
    createMatchHistoryRoutes();
}

async function startServer() {
    // process.on("unhandledRejection", (reason, promise) => {
    //     console.error("🔥 UNHANDLED PROMISE REJECTION:");
    //     console.error("Reason:", reason);
    //     console.error("Promise:", promise);
    // });
    try {
        await registerFastify();
        await createAllDefaultsUsers();
        await backend_log();
        await frontend_log();
        createRoutes();
        await fastify.listen({ port: 3000, host: "0.0.0.0" });
        if (isProd) {
            console.log("✅ Serveur Fastify en ligne : https://localhost:8443");
        }
        else {
            console.log("✅ Serveur Fastify en ligne : https://localhost:5173 et back dispo sur https://localhost:3000");
        }
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

await startServer();