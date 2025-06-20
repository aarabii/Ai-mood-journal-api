import { NextResponse as NextResponseKeywords } from "next/server";
import { sql as sqlKeywords } from "@vercel/postgres";

export async function GET() {
  try {
    const { rows } = await sqlKeywords`
        SELECT keyword, COUNT(*) as count
        FROM (SELECT unnest(keywords) as keyword FROM entries) as unnested_keywords
        GROUP BY keyword
        ORDER BY count DESC
        LIMIT 20;
    `;
    return NextResponseKeywords.json(rows);
  } catch (error) {
    console.error("Error fetching trending keywords:", error);
    return NextResponseKeywords.json(
      { error: "Failed to fetch trending keywords" },
      { status: 500 }
    );
  }
}
