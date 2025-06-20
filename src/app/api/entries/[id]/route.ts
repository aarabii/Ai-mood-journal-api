import { NextResponse as NextResponseNext } from "next/server";
import { sql as sqlNext } from "@vercel/postgres";
import { analyzeContent as analyzeContentNext } from "@/lib/huggingface";

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  const { id } = params;
  try {
    const { rows } =
      await sqlNext`SELECT *, "createdAt" as "createdAt" FROM entries WHERE id = ${id}`;
    if (rows.length === 0) {
      return NextResponseNext.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }
    return NextResponseNext.json(rows[0]);
  } catch (error) {
    console.error(`Error fetching entry ${id}:`, error);
    return NextResponseNext.json(
      { error: "Failed to fetch entry" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = params;
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string" || content.trim().length < 3) {
      return NextResponseNext.json(
        { error: "Content must be a string with at least 3 characters." },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();
    const analysis = await analyzeContentNext(trimmedContent);

    const keywords = Array.isArray(analysis.keywords)
      ? analysis.keywords.map((kw) => String(kw))
      : [];

    const formattedKeywords = `{${keywords.map((kw) => `"${kw}"`).join(",")}}`;

    const { rows } = await sqlNext`
      UPDATE entries
      SET
        content = ${trimmedContent},
        sentiment = ${analysis.sentiment},
        sentiment_score = ${analysis.sentimentScore},
        keywords = ${formattedKeywords}
      WHERE id = ${id}
      RETURNING *, "createdAt" as "createdAt";
    `;

    if (rows.length === 0) {
      return NextResponseNext.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }

    return NextResponseNext.json(rows[0]);
  } catch (error) {
    console.error(`Failed to update entry ${id}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponseNext.json(
      { error: "Failed to update entry", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = params;
  try {
    const result = await sqlNext`DELETE FROM entries WHERE id = ${id};`;

    if (result.rowCount === 0) {
      return NextResponseNext.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }

    return NextResponseNext.json({
      message: `Entry ${id} deleted successfully`,
    });
  } catch (error) {
    console.error(`Failed to delete entry ${id}:`, error);
    return NextResponseNext.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
