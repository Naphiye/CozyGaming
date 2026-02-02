import Database from "better-sqlite3"; 
import { drizzle } from "drizzle-orm/better-sqlite3";

// ouverture du fichier SQLite 
const sqlite = new Database("./data_db/database.sqlite"); 

// création de l'instance drizzle 
export const db = drizzle(sqlite);