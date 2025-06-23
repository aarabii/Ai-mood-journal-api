import * as dotenv from "dotenv";
import { setupDatabase, pool } from "../src/lib/db";

dotenv.config({ path: ".env.test" });

jest.setTimeout(30000);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing");
}

const API_BASE_URL = "http://localhost:3000/api";

describe("API Endpoint Tests", () => {
  let createdEntryId: string;

  beforeAll(async () => {
    await setupDatabase();
    await pool.query("DELETE FROM journal_entries");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM journal_entries");
    await pool.end();
  });

  describe("GET /api/entries", () => {
    it("should return an empty list with a 200 OK status", async () => {
      const response = await fetch(`${API_BASE_URL}/entries`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe("POST /api/entries", () => {
    it("should create a new entries and return 201 Created", async () => {
      const response = await fetch(`${API_BASE_URL}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "This is a test entry from our API test suite.",
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      createdEntryId = data.id;
    });
  });

  describe("PUT /api/entries/[id]", () => {
    it("should update the specified entries and return 200 OK", async () => {
      expect(createdEntryId).toBeDefined();

      const response = await fetch(
        `${API_BASE_URL}/entries/${createdEntryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "This entry has been updated by an API test.",
          }),
        }
      );

      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /api/entries/[id]", () => {
    it("should delete the specified journal entry and return 204 No Content", async () => {
      expect(createdEntryId).toBeDefined();

      const response = await fetch(
        `${API_BASE_URL}/entries/${createdEntryId}`,
        {
          method: "DELETE",
        }
      );

      expect(response.status).toBe(204);
    });
  });

  // clash with integration tests, so commenting out for now

  // describe("Aggregation Endpoints", () => {
  //   beforeAll(async () => {
  //     await pool.query("DELETE FROM journal_entries");
  //     await Promise.all([
  //       pool.query(
  //         "INSERT INTO journal_entries (content, sentiment, keywords) VALUES ($1, $2, $3)",
  //         ["I love testing APIs", "POSITIVE", ["testing", "apis"]]
  //       ),
  //       pool.query(
  //         "INSERT INTO journal_entries (content, sentiment, keywords) VALUES ($1, $2, $3)",
  //         ["This is a neutral observation about APIs", "NEUTRAL", ["apis"]]
  //       ),
  //       pool.query(
  //         "INSERT INTO journal_entries (content, sentiment, keywords) VALUES ($1, $2, $3)",
  //         ["I hate dealing with bugs", "NEGATIVE", ["bugs"]]
  //       ),
  //       pool.query(
  //         "INSERT INTO journal_entries (content, sentiment, keywords) VALUES ($1, $2, $3)",
  //         ["Another positive day of testing", "POSITIVE", ["testing"]]
  //       ),
  //     ]);
  //   });

  //   describe("GET /api/stats", () => {
  //     it("should return the correct breakdown of entry statistics with a 200 OK status", async () => {
  //       const response = await fetch(`${API_BASE_URL}/stats`);
  //       const stats = await response.json();

  //       expect(response.status).toBe(200);
  //       expect(stats.totalEntries).toBe(4);
  //       expect(stats.sentimentBreakdown).toBeInstanceOf(Array);

  //       const sentiments = stats.sentimentBreakdown.map(
  //         (s: { sentiment: string }) => s.sentiment
  //       );
  //       expect(sentiments).toContain("POSITIVE");
  //       expect(sentiments).toContain("NEGATIVE");
  //       expect(sentiments).toContain("NEUTRAL");
  //     });
  //   });

  //   describe("GET /api/keywords/trending", () => {
  //     it("should return trending keywords in the correct order with a 200 OK status", async () => {
  //       const response = await fetch(`${API_BASE_URL}/keywords/trending`);
  //       const keywords = await response.json();

  //       expect(response.status).toBe(200);
  //       expect(keywords).toBeInstanceOf(Array);
  //       expect(keywords.length).toBeGreaterThan(0);

  //       expect(keywords[0]).toEqual({ keyword: "testing", count: 2 });
  //       expect(keywords[1]).toEqual({ keyword: "apis", count: 2 });
  //       expect(keywords[2]).toEqual({ keyword: "bugs", count: 1 });
  //     });
  //   });
  // });
});
