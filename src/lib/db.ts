import { Pool } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const getDbClient = async () => {
  return await pool.connect();
};

export const sql = async (queryText: string, values: unknown[] = []) => {
  const client = await getDbClient();
  try {
    return await client.query(queryText, values);
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to execute database query.");
  } finally {
    client.release();
  }
};

export const setupDatabase = async () => {
  await sql(`
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sentiment_type') THEN
            CREATE TYPE sentiment_type AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL');
        END IF;
    END$$;
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT, -- You can add user authentication later
      content TEXT NOT NULL,
      sentiment sentiment_type,
      keywords TEXT[],
      created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
      updated_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc')
    );
  `);
};

export const initializeDb = async () => {
  console.log("Initializing database...");
  try {
    await setupDatabase();
    console.log('Table "journal_entries" created or already exists.');
    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("Database initialization failed:", error);
    return NextResponse.json(
      { error: "Database initialization failed." },
      { status: 500 }
    );
  }
};
