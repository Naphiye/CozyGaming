bienvenue dans les codes erreurs du backend

pour eviter les conflicts de message derreur ca serait bien quon saccorde sur un meme pattern de renvoie de code

jusque maintenant voila les codes erreurs que jai utiliser et leurs valeurs, la valeur peut etre changée et je me
suis peutetre trompée dans quelques codes

du coup voici le modele des throw que jai utilisé jusque maintenant ici dans par rapport a lauth et les tokens

pour lutiliser jai fait comme ca
catch (error: any) {
if (typeof error.code === "number" && error.message) {
return reply.code(error.code).send({ error: error.message });
}
return reply.code(500).send({ error: t("serverError") });
}

400 Bad Request

    The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).

            throw { code: 400, message: t("invalidData") };
            throw { code: 400, message: t("emailDontMatch") };
            throw { code: 400, message: t("passwordDontMatch") };
			throw { code: 400, message: t("samePassword") };
			throw { code: 400, message: t("sameMail") };
			throw { code: 400, message: t("noAvatarUploaded") };
			throw { code: 400, message: t("onlyImageFiles") };
			throw { code: 400, message: t("checkImageExt") };


le suivant cest avec zod

            throw { code: 400, message: parseResult.error.issues[0]?.message || t("invalidData") };

401 Unauthorized

    Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.

            throw { code: 401, message: t("connexionFailed") };
            throw { code: 401, message: t("unauthorized") };
			throw { code: 401, message: t("userNotFound") };

403 Forbidden

    The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. Unlike 401 Unauthorized, the client's identity is known to the server.

404 Not Found

	The server cannot find the requested resource.

			throw { code: 404, message: t("userNotFound") };

409 Conflict

    This response is sent when a request conflicts with the current state of the server. In WebDAV remote web authoring, 409 responses are errors sent to the client so that a user might be able to resolve a conflict and resubmit the request.

            throw { code: 409, message: t("usernameAlreadyExist") };
			throw { code: 409, message: t("emailAlreadyExist") };
			throw { code: 409, message: t("NoAvatarToDelete") };

500 Internal Server Error

	The server encountered an unexpected condition that prevented it from fulfilling the request.

		    throw { code: 500, message: t("hashingFailed") };
