export default {
    // USER HANDLING MESSAGE
    // USER - USERNAME
    usernameAlreadyExist: "Username already exists",
    usernameOrEmailIsWrong: "The username or email is incorrect",
    usernameTooShort: "Username is too short",
    usernameTooLong: "Username is too long",
    usernameInvalid: "Invalid characters",
    sameUsernameError: "The entered username is already associated with your account",
    usernameContainsInvalidChars: "The username contains invalid characters",
    usernameMustContainLetter: "The username must contain at least one letter (any language)",

    // USER - PASSWORD

    samePassword: "Please enter a new password different from the old one",
    oldPasswordDontMatch: "Invalid old password",

    passwordTooShort: "Password is too short",
    passwordTooLong: "Password is too long",
    passwordNoLowercase: "Password must contain at least one lowercase letter",
    passwordNoUppercase: "Password must contain at least one uppercase letter",
    passwordNoDigit: "Password must contain at least one digit",
    passwordNoSpecial: "Password must contain at least one special character: *()&%$#@!+\\-=~",
    passwordDontMatch: "Please enter the same password",


    // USER - EMAIL

    emailAlreadyExist: "This email address is already used by another account",
    sameMail: "The entered email is already associated with your account",

    emailDontMatch: "Please enter the same email address",
    emailInvalid: "Invalid email",

    // USER - FRIEND
    cantBeFriendWithYourself: "You cannot be friends with yourself",
    usersAreNotFriends: "The users are not friends",
    cannotPerformAction: "Cannot perform this action",
    
    // USER - OTHER
    LoggedOut: "Successfully logged out",
    connexionFailed: "Login failed",
    deletionSuccess: "Deletion successful",
    RegisterSuccess: "Registration successful",

    // AUTHENTICATION - OAUTH
    connexionOAuthOnly: "This account was created via GitHub. Please log in with GitHub.",

    // 2FA
    emailLoginFASubject: "2FA Login",
    emailActivateFASubject: "2FA Activation",
    emailDeactivateFASubject: "2FA Deactivation",
    hello: "Hello",
    emailLoginFAMessage: "Your 2FA is enabled, here is your login code:",
    emailActivateFAMessage: "You requested activation of two-factor authentication, here is your code:",
    emailDeactivateFAMessage: "You requested deactivation of two-factor authentication, here is your code:",

    conflitTwoFAStatus: "The requested 2FA status is the same as the current status",
    InvalidCodeFA: "Invalid 2FA code",
    FASendMailsuccess: "2FA email sent successfully",
    connexionByFAsuccess: "2FA login successful",
    activationFAsuccess: "2FA activation successful",
    deactivationFAsuccess: "2FA deactivation successful",

    // TOKEN AND RATE LIMIT
    accessOK: "Access granted",
    tooManyRequests: "Too many requests",
    seconds: "seconds",
    accessNotOK: "Access denied",

    // ERROR
    deletionFailed: "Account deletion failed",
    invalidData: "Invalid data",
    unauthorized: "Unauthorized",
    hashingFailed: "Bcrypt failed",
    permissionDenied: "Permission denied",
    serverError: "Server error",
    emailSendError: "Failed to send email",
    FAalreadySet: "2FA is already set to the sent value",
    Invalidtokendateformat: "Invalid date format",
    getUsernameError: "Failed to get username",
    putUsernameError: "Failed to update username",
    putPasswordError: "Failed to update password",
    getMailError: "Failed to get email",
    putMailError: "Failed to update email",
    putLanguageError: "Failed to update language",
    sameLanguageError: "Error: same language selected",
    sameAvatarError: "Error: same avatar selected",
    putAvatarError: "Failed to update avatar",
    noAvatarUploaded: "No avatar selected",
    deleteAvatarSuccess: "Avatar deleted successfully",
    deleteAvatarFail: "Failed to delete avatar",
    deleteAvatarPathFail: "Failed to delete avatar path",
    getPublicMeError: "Failed to get user",
    NoAvatarToDelete: "No avatar to delete",
    usernameLinkedToRegisteredAccount: "The username is already linked to an account, please choose another one.",
    InsertionFailed: "Database insertion failed",
    userNotFound: "User not found",
};
