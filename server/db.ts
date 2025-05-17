import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { notes, users } from "@shared/schema";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";

const connectionString = process.env.DATABASE_URL || "";

// For connecting to the database
const client = postgres(connectionString);
export const db = drizzle(client);

// Initialize database with schemas
export async function initializeDatabase() {
  try {
    console.log("Initializing database...");
    
    // Check if tables exist
    const tablesResult = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const existingTables = tablesResult.map(r => r.table_name);
    console.log("Existing tables:", existingTables);
    
    // Only create tables if they don't exist
    if (!existingTables.includes('users')) {
      console.log("Creating users table...");
      await client`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `;
    }
    
    if (!existingTables.includes('notes')) {
      console.log("Creating notes table...");
      await client`
        CREATE TABLE IF NOT EXISTS notes (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          content TEXT DEFAULT '',
          x INTEGER NOT NULL,
          y INTEGER NOT NULL,
          width INTEGER NOT NULL,
          height INTEGER NOT NULL,
          color TEXT NOT NULL,
          z_index INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `;
    }
    
    console.log("Database initialization complete");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}