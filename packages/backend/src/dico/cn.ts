export default {
    // USER HANDLING MESSAGE
    // USER - USERNAME
    usernameAlreadyExist: "用户名已存在", // Le username existe déjà
    usernameOrEmailIsWrong: "用户名或电子邮件不正确", // Le nom d'utilisateur ou l'e-mail est incorrect
    usernameTooShort: "用户名太短", // Le username est trop court
    usernameTooLong: "用户名太长", // Le username est trop long
    usernameInvalid: "包含非法字符", // Caractères non autorisés
    sameUsernameError: "输入的用户名已关联到您的账户", // Le login entré est déjà associé à votre compte
    usernameContainsInvalidChars: "用户名包含不允许的字符", // Le login contient des caractères non autorisés
    usernameMustContainLetter: "用户名必须至少包含一个字母（所有语言）", // Le login doit contenir au moins une lettre (toutes langues)

    // USER - PASSWORD

    samePassword: "请输入与旧密码不同的新密码", // Veuillez entrer un nouveau mot de passe différent de l'ancien
    oldPasswordDontMatch: "旧密码无效", // Ancien mot de passe invalide
    passwordTooShort: "密码太短", // Mot de passe trop court
    passwordTooLong: "密码太长", // Mot de passe trop long
    passwordNoLowercase: "密码必须至少包含一个小写字母", // Mot de passe : au moins une minuscule
    passwordNoUppercase: "密码必须至少包含一个大写字母", // Mot de passe : au moins une majuscule
    passwordNoDigit: "密码必须至少包含一个数字", // Mot de passe : au moins un chiffre
    passwordNoSpecial: "密码必须至少包含一个特殊字符：*()&%$#@!+\\-=~", // Mot de passe : au moins un caractère spécial : *()&%$#@!+\-=~
    passwordDontMatch: "请确保两次输入的密码一致", // Veuillez entrer le même mot de passe

    // USER - EMAIL

    emailAlreadyExist: "该邮箱已被其他账户使用", // Cette adresse email est déjà utilisée par un autre compte
    sameMail: "输入的邮箱已关联到您的账户", // L'adresse email entrée est celle déjà associée à votre compte
    emailDontMatch: "请输入相同的邮箱地址", // Veuillez entrer la même adresse email
    emailInvalid: "邮箱地址无效", // Email invalide

    // USER - FRIEND
    cantBeFriendWithYourself: "您不能与自己成为好友", // Vous ne pouvez pas être ami avec vous-même
    usersAreNotFriends: "用户之间不是好友关系", // Les utilisateurs ne sont pas amis
    cannotPerformAction: "无法执行此操作", // Impossible d'effectuer cette action
    
    // USER - OTHER
    LoggedOut: "成功注销", // Déconnexion réussie
    connexionFailed: "登录失败", // Connexion refusée
    deletionSuccess: "删除成功", // Suppression réussie
    RegisterSuccess: "注册成功", // Inscription réussie

    // AUTHENTICATION - OAUTH
    connexionOAuthOnly: "该账户通过 GitHub 创建，请使用 GitHub 登录。", // Ce compte a été créé via GitHub. Connectez-vous avec GitHub.

    // 2FA
    emailLoginFASubject: "2FA 登录", // Connexion 2FA
    emailActivateFASubject: "2FA 激活", // Activation de la 2FA
    emailDeactivateFASubject: "2FA 停用", // Désactivation de la 2FA
    hello: "您好", // Bonjour
    emailLoginFAMessage: "您的 2FA 已启用，登录验证码如下：", // Votre 2FA est activé, voici votre code de connexion :
    emailActivateFAMessage: "您已请求启用双重身份验证，验证码如下：", // Vous avez demandé l'activation de la double authentification, voici votre code :
    emailDeactivateFAMessage: "您已请求停用双重身份验证，验证码如下：", // Vous avez demandé la désactivation de la double authentification, voici votre code :

    conflitTwoFAStatus: "请求的 2FA 状态与当前状态相同", // Le statut 2FA demandé est identique au statut actuel
    InvalidCodeFA: "2FA 验证码无效", // Code 2FA invalide
    FASendMailsuccess: "2FA 邮件发送成功", // Email 2FA envoyé avec succès
    connexionByFAsuccess: "2FA 登录成功", // La connexion 2FA a réussi
    activationFAsuccess: "2FA 激活成功", // L'activation du 2FA a réussi
    deactivationFAsuccess: "2FA 停用成功", // La désactivation du 2FA a réussi

    // TOKEN AND RATE LIMIT
    accessOK: "访问授权", // Accès autorisé
    tooManyRequests: "请求过多", // Trop de requêtes
    seconds: "秒", // Secondes
    accessNotOK: "访问被拒绝", // Accès refusé

    // ERROR
    deletionFailed: "账户删除失败", // La suppression du compte a échoué
    invalidData: "数据无效", // Donnée invalide
    unauthorized: "未授权", // Autorisation refusée
    hashingFailed: "Bcrypt 执行失败", // Bcrypt a échoué
    permissionDenied: "权限被拒绝", // Permission refusée
    serverError: "服务器错误", // Erreur de serveur
    emailSendError: "邮件发送失败", // L'envoi de l'email a échoué
    FAalreadySet: "2FA 已设置为发送的值", // Le 2FA est déjà configuré à la valeur envoyée
    Invalidtokendateformat: "日期格式无效", // Le format de la date n'est pas valide
    getUsernameError: "获取用户名失败", // Erreur de récupération du nom d'utilisateur
    putUsernameError: "修改用户名失败", // Erreur modification du nom d'utilisateur
    putPasswordError: "修改密码失败", // Erreur modification du mot de passe
    getMailError: "获取邮箱失败", // Erreur de récupération de l'email
    putMailError: "修改邮箱失败", // Erreur modification de l'email
    putLanguageError: "修改语言失败", // Erreur modification de la langue
    sameLanguageError: "错误：选择了相同的语言", // Erreur : même langue sélectionnée
    sameAvatarError: "错误：选择了相同的头像", // Erreur : même avatar
    putAvatarError: "修改头像失败", // Erreur modification de l'avatar
    noAvatarUploaded: "未选择头像", // Pas d'avatar sélectionné
    deleteAvatarSuccess: "头像删除成功", // Suppression de l'avatar réussie
    deleteAvatarFail: "头像删除失败", // Échec de la suppression de l'avatar
    deleteAvatarPathFail: "头像路径删除失败", // Échec de la suppression du chemin de l'avatar
    getPublicMeError: "获取用户信息失败", // Erreur de récupération de l'utilisateur
    NoAvatarToDelete: "没有可删除的头像", // Pas d'avatar à supprimer
    usernameLinkedToRegisteredAccount: "该用户名已关联到一个账户，请选择其他用户名。", // Le login est déjà associé à un compte, vous devez en choisir un autre.
    InsertionFailed: "数据库插入失败", // Insertion dans la base de données échouée
    userNotFound: "未找到用户", // Utilisateur non trouvé
};
