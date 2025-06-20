// in care table not created so to manually create the table
import { initializeDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await initializeDb();
    return NextResponse.json({
      message:
        "Database setup successful. The 'journal_entries' table should now exist.",
    });
  } catch (error) {
    console.error("Database setup failed:", error);
    return NextResponse.json(
      { error: "Failed to set up the database." },
      { status: 500 }
    );
  }
}
