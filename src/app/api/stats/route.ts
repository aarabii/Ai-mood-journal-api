import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalEntriesPromise = sql("SELECT COUNT(*) FROM journal_entries");
    const sentimentBreakdownPromise = sql(
      `SELECT sentiment, COUNT(*) as count
             FROM journal_entries
             WHERE sentiment IS NOT NULL
             GROUP BY sentiment`
    );

    const [totalEntriesRes, sentimentBreakdownRes] = await Promise.all([
      totalEntriesPromise,
      sentimentBreakdownPromise,
    ]);

    const stats = {
      totalEntries: parseInt(totalEntriesRes.rows[0].count, 10),
      sentimentBreakdown: sentimentBreakdownRes.rows,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics." },
      { status: 500 }
    );
  }
}
