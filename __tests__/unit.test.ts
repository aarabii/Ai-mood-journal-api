import { testApiHandler } from "next-test-api-route-handler";
import * as appHandler from "@/app/api/entries/route";
import { sql } from "../src/lib/db";
import { analyzeSentiment, extractKeywords } from "../src/lib/huggingface";

global.fetch = jest.fn();
process.env.HF_TOKEN = "test-token";

jest.mock("../src/lib/db", () => ({
  sql: jest.fn(),
}));

const mockedSql = sql as jest.Mock;

describe("Unit Testing", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
    mockedSql.mockReset();
  });

  describe("Function Tests", () => {
    describe("Fnc: analyzeSentiment", () => {
      it("should return 'POSITIVE' when the POSITIVE score is highest", async () => {
        const mockApiResponse = [
          [
            { label: "POSITIVE", score: 0.9998 },
            { label: "NEGATIVE", score: 0.0001 },
          ],
        ];
        (fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockApiResponse,
        });
        const sentiment = await analyzeSentiment("This is a wonderful day!");
        expect(sentiment).toBe("POSITIVE");
      });

      describe("when handling errors", () => {
        let consoleErrorSpy: jest.SpyInstance;

        beforeEach(() => {
          consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});
        });

        afterEach(() => {
          consoleErrorSpy.mockRestore();
        });

        it("should return 'NEUTRAL' when the API returns an error", async () => {
          (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({ error: "Model is currently loading" }),
          });
          const sentiment = await analyzeSentiment("This will fail.");
          expect(sentiment).toBe("NEUTRAL");
        });

        it("should return 'NEUTRAL' if the fetch call throws an exception", async () => {
          (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
          const sentiment = await analyzeSentiment(
            "This will cause an exception."
          );
          expect(sentiment).toBe("NEUTRAL");
        });

        it("should return 'NEUTRAL' for malformed API responses", async () => {
          (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ unexpected: "data" }),
          });
          const sentiment = await analyzeSentiment("Malformed response test.");
          expect(sentiment).toBe("NEUTRAL");
        });
      });
    });

    describe("Fnc: extractKeywords", () => {
      it("should extract and return unique keywords from the text", async () => {
        const mockApiResponse = [
          { entity_group: "PER", word: "John Doe" },
          { entity_group: "LOC", word: "New York" },
          { entity_group: "ORG", word: "Google" },
          { entity_group: "LOC", word: "New York" },
        ];
        (fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockApiResponse,
        });
        const keywords = await extractKeywords(
          "John Doe from Google visited New York."
        );
        expect(keywords).toEqual(["John Doe", "New York", "Google"]);
      });

      it("should return an empty array if no relevant entities are found", async () => {
        const mockApiResponse = [{ entity_group: "O", word: "this" }];
        (fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockApiResponse,
        });
        const keywords = await extractKeywords("Just a regular sentence.");
        expect(keywords).toEqual([]);
      });

      describe("when handling errors", () => {
        let consoleErrorSpy: jest.SpyInstance;

        beforeEach(() => {
          consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});
        });

        afterEach(() => {
          consoleErrorSpy.mockRestore();
        });

        it("should return an empty array when the API returns an error", async () => {
          (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            status: 503,
            json: async () => ({ error: "Model is currently loading" }),
          });
          const keywords = await extractKeywords("This will fail.");
          expect(keywords).toEqual([]);
        });

        it("should return an empty array if the API response is not an array", async () => {
          (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ message: "Unexpected format" }),
          });
          const keywords = await extractKeywords("Malformed response test.");
          expect(keywords).toEqual([]);
        });

        it("should return an empty array if the fetch call throws an exception", async () => {
          (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
          const keywords = await extractKeywords(
            "This will cause an exception."
          );
          expect(keywords).toEqual([]);
        });
      });
    });
  });

  describe("Endpoint: /api/entries", () => {
    it("GET should return an empty array when no entries exist", async () => {
      mockedSql.mockResolvedValue({ rows: [] });

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const res = await fetch({ method: "GET" });
          const json = await res.json();

          expect(res.status).toBe(200);
          expect(json).toEqual([]);
          expect(mockedSql).toHaveBeenCalledWith(
            "SELECT id, content, sentiment, keywords, created_at FROM journal_entries ORDER BY created_at DESC"
          );
        },
      });
    });
  });
});
