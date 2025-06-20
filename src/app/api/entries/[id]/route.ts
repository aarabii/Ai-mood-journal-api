import { sql } from "@/lib/db";
import { analyzeSentiment, extractKeywords } from "@/lib/huggingface";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
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

    const { rows, rowCount } = await sql(
      `UPDATE journal_entries
             SET content = $1, sentiment = $2, keywords = $3, updated_at = (now() AT TIME ZONE 'utc')
             WHERE id = $4
             RETURNING id, content, sentiment, keywords, created_at`,
      [content, sentiment, keywords, id]
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(`Failed to update entry ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to update journal entry." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const { rowCount } = await sql(
      "DELETE FROM journal_entries WHERE id = $1",
      [id]
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    console.error(`Failed to delete entry ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete journal entry." },
      { status: 500 }
    );
  }
}
