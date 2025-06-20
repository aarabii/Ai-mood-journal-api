import { NextResponse as NextResponseDate } from "next/server";
import { sql as sqlDate } from "@vercel/postgres";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponseDate.json(
        { error: "Both startDate and endDate query parameters are required." },
        { status: 400 }
      );
    }

    const endDateTime = `${endDate} 23:59:59`;

    const { rows } = await sqlDate`
      SELECT *, "createdAt" as "createdAt" FROM entries
      WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDateTime}
      ORDER BY "createdAt" DESC;
    `;

    return NextResponseDate.json(rows);
  } catch (error) {
    console.error("Error fetching entries by date range:", error);
    return NextResponseDate.json(
      { error: "Failed to fetch entries by date" },
      { status: 500 }
    );
  }
}
