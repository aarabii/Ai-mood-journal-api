import { sql } from "@/lib/db";
import { analyzeSentiment, extractKeywords } from "@/lib/huggingface";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql(
      "SELECT id, content, sentiment, keywords, created_at FROM journal_entries ORDER BY created_at DESC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch journal entries." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Content is required." },
        { status: 400 }
      );
    }

    const [sentiment, keywords] = await Promise.all([
      analyzeSentiment(content),
      extractKeywords(content),
    ]);

    const { rows } = await sql(
      `INSERT INTO journal_entries (content, sentiment, keywords)
             VALUES ($1, $2, $3)
             RETURNING id, content, sentiment, keywords, created_at`,
      [content, sentiment, keywords]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create entry:", error);
    return NextResponse.json(
      { error: "Failed to create journal entry." },
      { status: 500 }
    );
  }
}
