import { TrendingKeyword } from "@/constant/types";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TrendingKeywordsProps {
  keywords: TrendingKeyword[];
}

export const TrendingKeywords = ({ keywords }: TrendingKeywordsProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Trending Keywords</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {keywords.map(({ keyword, count }) => {
          const size = Math.min(count * 0.15 + 0.8, 1.5);
          return (
            <span
              key={keyword}
              className="text-primary hover:text-primary transition-colors cursor-default"
              style={{ fontSize: `${size}rem` }}
              title={`Appears ${count} times`}
            >
              {keyword}
            </span>
          );
        })}
      </div>
    </CardContent>
  </Card>
);
