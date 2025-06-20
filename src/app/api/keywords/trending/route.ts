import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql(`
            SELECT keyword, COUNT(keyword) as count
            FROM (SELECT unnest(keywords) as keyword FROM journal_entries) as k
            GROUP BY keyword
            ORDER BY count DESC
            LIMIT 10;
        `);

    const trendingKeywords = rows.map((row) => ({
      ...row,
      count: parseInt(row.count, 10),
    }));

    return NextResponse.json(trendingKeywords);
  } catch (error) {
    console.error("Failed to fetch trending keywords:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending keywords." },
      { status: 500 }
    );
  }
}
