import * as dotenv from "dotenv";
import { setupDatabase, pool } from "../src/lib/db";

dotenv.config();

jest.setTimeout(30000);

if (!process.env.DATABASE_URL || !process.env.HF_TOKEN) {
  throw new Error(
    "DATABASE_URL and HF_TOKEN must be set in your .env.test file."
  );
}

const API_BASE_URL = "http://localhost:3000/api";

type SentimentBreakdownItem = {
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  count: string;
};

describe("API Integration Tests", () => {
  let createdEntryId: string;

  beforeAll(async () => {
    await setupDatabase();
    await pool.query("DELETE FROM journal_entries");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM journal_entries");
    await pool.end();
  });

  describe("Entries (/api/entries)", () => {
    it("1. POST - should create a new journal entry successfully", async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/entries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "Today was a fantastic day, full of success and joy.",
          }),
        });

        const responseText = await response.text();
        const data = JSON.parse(responseText);

        expect(response.status).toBe(201);
        expect(data.id).toBeDefined();
        expect(data.content).toBe(
          "Today was a fantastic day, full of success and joy."
        );

        expect(["POSITIVE", "NEGATIVE", "NEUTRAL"]).toContain(data.sentiment);
        expect(data.keywords).toBeInstanceOf(Array);

        createdEntryId = data.id;
      } catch (error) {
        console.error("An error occurred during the POST test:", error);
        throw error;
      }
    });

    it("2. PUT - should update the created journal entry", async () => {
      expect(createdEntryId).toBeDefined();

      const response = await fetch(
        `${API_BASE_URL}/entries/${createdEntryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "Actually, it was a rather boring and dull day.",
          }),
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(createdEntryId);
      expect(data.content).toBe(
        "Actually, it was a rather boring and dull day."
      );
      expect(data.sentiment).toBe("NEGATIVE");
    });

    it("3. DELETE - should delete the journal entry", async () => {
      expect(createdEntryId).toBeDefined();

      const response = await fetch(
        `${API_BASE_URL}/entries/${createdEntryId}`,
        {
          method: "DELETE",
        }
      );

      expect(response.status).toBe(204);

      const verifyResponse = await fetch(
        `${API_BASE_URL}/entries/${createdEntryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "Trying to update a deleted entry.",
          }),
        }
      );
      expect(verifyResponse.status).toBe(404);
    });
  });

  describe("Aggregation Endpoints (/api/stats and /api/keywords/trending)", () => {
    beforeAll(async () => {
      await pool.query("DELETE FROM journal_entries");

      await Promise.all([
        pool.query(
          "INSERT INTO journal_entries (content, sentiment, keywords) VALUES ($1, $2, $3)",
          ["I love testing", "POSITIVE", ["testing", "software"]]
        ),
        pool.query(
          "INSERT INTO journal_entries (content, sentiment, keywords) VALUES ($1, $2, $3)",
          [
            "Testing is fun and rewarding",
            "POSITIVE",
            ["testing", "software", "fun"],
          ]
        ),
        pool.query(
          "INSERT INTO journal_entries (content, sentiment, keywords) VALUES ($1, $2, $3)",
          ["I hate bugs", "NEGATIVE", ["bugs", "software"]]
        ),
      ]);
    });

    it("GET /api/stats - should return correct aggregate statistics", async () => {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const stats = await response.json();

      expect(response.status).toBe(200);
      expect(stats.totalEntries).toBe(3);

      const positiveData = (
        stats.sentimentBreakdown as SentimentBreakdownItem[]
      ).find((s) => s.sentiment === "POSITIVE");
      const negativeData = (
        stats.sentimentBreakdown as SentimentBreakdownItem[]
      ).find((s) => s.sentiment === "NEGATIVE");

      expect(positiveData).toBeDefined();
      expect(negativeData).toBeDefined();

      expect(parseInt(positiveData!.count, 10)).toBe(2);
      expect(parseInt(negativeData!.count, 10)).toBe(1);
    });

    it("GET /api/keywords/trending - should return correctly counted and sorted keywords", async () => {
      const response = await fetch(`${API_BASE_URL}/keywords/trending`);
      const keywords = await response.json();

      expect(response.status).toBe(200);
      expect(keywords).toHaveLength(4);

      expect(keywords[0]).toEqual({ keyword: "software", count: 3 });
      expect(keywords[1]).toEqual({ keyword: "testing", count: 2 });
      expect(keywords[2]).toEqual({ keyword: "bugs", count: 1 });
      expect(keywords[3]).toEqual({ keyword: "fun", count: 1 });
    });
  });
});
