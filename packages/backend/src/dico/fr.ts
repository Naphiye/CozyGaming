import { access } from "node:fs";

export default {
    // USER HANDLING MESSAGE

    // USER - USERNAME
    usernameAlreadyExist: "Le username existe déjà",
    usernameOrEmailIsWrong: "Le nom d'utilisateur ou l'e-mail est incorrect",
    usernameTooShort: "Le username est trop court",
    usernameTooLong: "Le username est trop long",
    usernameInvalid: "Caractères non autorisés",
    sameUsernameError: "Le login entré est déjà associé à votre compte",
    usernameContainsInvalidChars: "Le login contient des caractères non autorisés",
    usernameMustContainLetter: "Le login doit contenir au moins une lettre (toutes langues)",

    // USER - PASSWORD

    samePassword: "Veuillez entrer un nouveau mot de passe différent de l'ancien",
    oldPasswordDontMatch: "Ancien mot de passe invalide",
    passwordTooShort: "Mot de passe trop court",
    passwordTooLong: "Mot de passe trop long",
    passwordNoLowercase: "Mot de passe : au moins une minuscule",
    passwordNoUppercase: "Mot de passe : au moins une majuscule",
    passwordNoDigit: "Mot de passe : au moins un chiffre",
    passwordNoSpecial: "Mot de passe : au moins un caractère spécial : *()&%$#@!+\\-=~",
    passwordDontMatch: "Veuillez entrer le même mot de passe",

    // USER - EMAIL

    emailAlreadyExist: "Cette adresse email est déjà utilisée par un autre compte",
    sameMail: "L'adresse email entrée est celle déjà associée à votre compte",
    emailDontMatch: "Veuillez entrer la même adresse email",
    emailInvalid: "Email invalide",

    // USER - FRIEND
    cantBeFriendWithYourself: "Vous ne pouvez pas être ami avec vous-même",
    usersAreNotFriends: "Les utilisateurs ne sont pas amis",
    cannotPerformAction: "Impossible d'effectuer cette action",

    // USER - OTHER
    LoggedOut: "Déconnexion réussie",
    connexionFailed: "Connexion refusée",
    deletionSuccess: "Suppression réussie",
    RegisterSuccess: "Inscription réussie",

    // AUTHENTICATION - OAUTH
    connexionOAuthOnly: "Ce compte a été créé via GitHub. Connectez-vous avec GitHub.",

    // 2FA
    emailLoginFASubject: "Connexion 2FA",
    emailActivateFASubject: "Activation de la 2FA",
    emailDeactivateFASubject: "Désactivation de la 2FA",
    hello: "Bonjour",
    emailLoginFAMessage: "Votre 2FA est activé, voici votre code de connexion :",
    emailActivateFAMessage: "Vous avez demandé l'activation de la double authentification, voici votre code :",
    emailDeactivateFAMessage: "Vous avez demandé la désactivation de la double authentification, voici votre code :",

    conflitTwoFAStatus: "Le statut 2FA demandé est identique au statut actuel",
    InvalidCodeFA: "Code 2FA invalide",
    FASendMailsuccess: "Email 2FA envoyé avec succès",
    connexionByFAsuccess: "La connexion 2FA a réussi",
    activationFAsuccess: "L'activation du 2FA a réussi",
    deactivationFAsuccess: "La désactivation du 2FA a réussi",

    // TOKEN AND RATE LIMIT
    accessOK: "Accès autorisé",
    tooManyRequests: "Trop de requêtes",
    seconds: "Secondes",
    accessNotOK: "Accès refusé",

    // ERROR
    deletionFailed: "La suppression du compte a échoué",
    invalidData: "Donnée invalide",
    unauthorized: "Autorisation refusée",
    hashingFailed: "Bcrypt a échoué",
    permissionDenied: "Permission refusée",
    serverError: "Erreur de serveur",
    emailSendError: "L'envoi de l'email a échoué",
    FAalreadySet: "Le 2FA est déjà configuré à la valeur envoyée",
    Invalidtokendateformat: "Le format de la date n'est pas valide",
    getUsernameError: "Erreur de récupération du nom d'utilisateur",
    putUsernameError: "Erreur modification du nom d'utilisateur",
    putPasswordError: "Erreur modification du mot de passe",
    getMailError: "Erreur de récupération de l'email",
    putMailError: "Erreur modification de l'email",
    putLanguageError: "Erreur modification de la langue",
    sameLanguageError: "Erreur : même langue sélectionnée",
    sameAvatarError: "Erreur : même avatar",
    putAvatarError: "Erreur modification de l'avatar",
    noAvatarUploaded: "Pas d'avatar sélectionné",
    deleteAvatarSuccess: "Suppression de l'avatar réussie",
    deleteAvatarFail: "Échec de la suppression de l'avatar",
    deleteAvatarPathFail: "Échec de la suppression du chemin de l'avatar",
    getPublicMeError: "Erreur de récupération de l'utilisateur",
    NoAvatarToDelete: "Pas d'avatar à supprimer",
    usernameLinkedToRegisteredAccount: "Le login est déjà associé à un compte, vous devez en choisir un autre.",
    InsertionFailed: "Insertion dans la base de données échouée",
    userNotFound: "Utilisateur non trouvé",

};
