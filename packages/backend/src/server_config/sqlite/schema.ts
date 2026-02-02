import { sqliteTable, text, integer, uniqueIndex, } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull().unique(),
    email: text("email").notNull(),
    passwordHash: text("passwordHash").notNull(),
    lang: text("lang").notNull(),
    twoFA: integer("twoFA", { mode: 'boolean' }).notNull().default(false),
    avatar: text("avatar").notNull().default("default-avatar.png"),
    isOAuth: integer("isOAuth", { mode: 'boolean' }).notNull().default(false)
});


export const accessTokens = sqliteTable("access_tokens", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    // “onDelete: 'cascade'”
    // Ça veut dire :
    // Si un utilisateur est supprimé → tous ses refresh tokens sont supprimés automatiquement.
    tokenHash: text("tokenHash").notNull(),
    expiresAt: text("expiresAt").notNull(),
});

export const twoFAToken = sqliteTable("2FA_token", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    randomTokenHash: text("randomTokenHash").notNull(),
    expiresAt: text("expiresAt").notNull(),
});

export const usersTwoFA = sqliteTable("2FA_code", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    twoFACodeHash: text("twoFACodeHash").notNull(),
    expiresAt: text("expiresAt").notNull(),
});

export const matchHistory = sqliteTable("matchHistory", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    mode: text("mode").notNull(),
    playerLeft: text("playerLeft").notNull(),
    scoreLeft: integer("scoreLeft"),
    playerRight: text("playerRight").notNull(),
    scoreRight: integer("scoreRight"),
    userplace: text("userplace").notNull(),
    date: integer("date").notNull(), // timestamp Unix
});

export const usersFriends = sqliteTable("usersFriends", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    smallerUserId: integer("first_user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    greaterUserId: integer("second_user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    actionByUserId: integer("who_is_doing_action")
        .notNull(),
    status: text("status", { enum: ["pending", "accepted", "blocked"] }).notNull(),
    // enum dans Drizzle - comment ça marche et comment l’utiliser
    // ➡️ Cela veut dire que la colonne status ne peut contenir que l’une de ces trois valeurs.
}, (table) => [
    uniqueIndex("unique_friendship").on(table.smallerUserId, table.greaterUserId),
    // “Pour une combinaison donnée de smallerUserId et greaterUserId, il ne peut exister qu’une seule ligne.”
]);


// sqlite> .tables

// pour ameliorer la visibilité de la db
// .headers on
// .mode column

// pour voir les tables
// sqlite> select * from users; voir les users