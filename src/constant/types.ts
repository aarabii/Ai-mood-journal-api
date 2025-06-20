export interface JournalEntry {
  id: string;
  content: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  keywords: string[];
  createdAt: string;
}

export interface TrendingKeyword {
  keyword: string;
  count: number;
}

export interface Stats {
  totalEntries: number;
  sentimentBreakdown: {
    sentiment: string;
    count: string;
    percentage: number;
  }[];
  averageSentimentScore: number;
}
