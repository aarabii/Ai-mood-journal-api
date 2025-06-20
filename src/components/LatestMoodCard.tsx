import { sentimentEmojis, sentimentColors } from "@/constant/sentiments";

import { JournalEntry } from "@/constant/types";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface LatestMoodCardProps {
  entry: JournalEntry;
}

export const LatestMoodCard = ({ entry }: LatestMoodCardProps) => (
  <Card className="overflow-hidden">
    <div
      className="h-2"
      style={{
        backgroundColor: sentimentColors[entry.sentiment],
      }}
    />
    <CardHeader className="text-center pb-2">
      <CardTitle>Latest Mood</CardTitle>
    </CardHeader>
    <CardContent className="text-center">
      <div className="text-6xl mb-2">{sentimentEmojis[entry.sentiment]}</div>
      <p
        className="text-lg font-semibold capitalize"
        style={{ color: sentimentColors[entry.sentiment] }}
      >
        {entry.sentiment.toLowerCase()}
      </p>
    </CardContent>
  </Card>
);
