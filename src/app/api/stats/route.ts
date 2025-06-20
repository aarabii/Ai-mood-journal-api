import { NextResponse as NextResponseStats } from "next/server";
import { db } from "@vercel/postgres";

export async function GET() {
  try {
    const sentimentQuery = `
      SELECT
        sentiment,
        COUNT(id) as count
      FROM entries
      WHERE sentiment IS NOT NULL
      GROUP BY sentiment;
    `;

    const totalQuery = `SELECT COUNT(*) as total FROM entries;`;
    const avgScoreQuery = `SELECT AVG(sentiment_score) as average_score FROM entries WHERE sentiment_score IS NOT NULL;`;

    const [sentimentResult, totalResult, avgScoreResult] = await Promise.all([
      db.query(sentimentQuery),
      db.query(totalQuery),
      db.query(avgScoreQuery),
    ]);

    const totalEntries = parseInt(totalResult.rows[0].total, 10);
    const sentimentBreakdown = sentimentResult.rows.map((row) => ({
      ...row,
      percentage:
        totalEntries > 0 ? (parseInt(row.count, 10) / totalEntries) * 100 : 0,
    }));

    const stats = {
      totalEntries,
      sentimentBreakdown,
      averageSentimentScore: parseFloat(
        avgScoreResult.rows[0].average_score || 0
      ),
    };

    return NextResponseStats.json(stats);
  } catch (error) {
    console.error("Error fetching comprehensive stats:", error);
    return NextResponseStats.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
