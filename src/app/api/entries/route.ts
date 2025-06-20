import { NextResponse } from "next/server";
import { db, sql } from "@vercel/postgres";
// Note: analyzeContent is imported in the POST function below

// Helper to ensure the database table exists
async function setupDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        sentiment VARCHAR(20),
        sentiment_score REAL,
        keywords TEXT[],
        "createdAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log("Database table 'entries' is ready.");
  } catch (error) {
    console.error("Error setting up database table:", error);
    throw error;
  }
}

// Run setup
setupDatabase();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    const query = search
      ? sql`SELECT *, "createdAt" as "createdAt" FROM entries WHERE content ILIKE ${
          "%" + search + "%"
        } ORDER BY "createdAt" DESC LIMIT ${limit} OFFSET ${offset}`
      : sql`SELECT *, "createdAt" as "createdAt" FROM entries ORDER BY "createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;

    const { rows } = await db.query(query);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string" || content.trim().length < 3) {
      return NextResponse.json(
        { error: "Content must be a string with at least 3 characters." },
        { status: 400 }
      );
    }

    const analysis = await analyzeContent(content.trim());

    const { rows } = await sql`
      INSERT INTO entries (content, sentiment, sentiment_score, keywords)
      VALUES (${content.trim()}, ${analysis.sentiment}, ${
      analysis.sentimentScore
    }, ${analysis.keywords})
      RETURNING *, "createdAt" as "createdAt";
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create entry:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to create new entry", details: errorMessage },
      { status: 500 }
    );
  }
}
