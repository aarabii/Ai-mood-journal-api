import { TrendingKeyword } from "@/constant/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TrendingKeywordsProps {
  keywords: TrendingKeyword[];
}

export const TrendingKeywords = ({ keywords }: TrendingKeywordsProps) => {
  const hasKeywords = keywords && keywords.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        {hasKeywords ? (
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {keywords.map(({ keyword, count }) => {
              const size = Math.max(0.8, Math.min(count * 0.15 + 0.8, 1.5));
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
        ) : (
          <div className="flex h-24 items-center justify-center">
            <p className="text-muted-foreground">
              No keywords have been identified yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
