import { JournalEntry, Stats, TrendingKeyword } from "@/constant/types";

import { LatestMoodCard } from "./LatestMoodCard";
import { MoodDistributionChart } from "./MoodDistributionChart";
import { TrendingKeywords } from "./TrendingKeywords";

interface DashboardSidebarProps {
  latestEntry: JournalEntry | undefined;
  stats: Stats | null;
  moodDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  trendingKeywords: TrendingKeyword[];
}

export const DashboardSidebar = ({
  latestEntry,
  stats,
  moodDistribution,
  trendingKeywords,
}: DashboardSidebarProps) => (
  <aside className="space-y-6">
    {latestEntry && <LatestMoodCard entry={latestEntry} />}

    {stats && stats.totalEntries > 0 && (
      <MoodDistributionChart moodDistribution={moodDistribution} />
    )}

    {trendingKeywords.length > 0 && (
      <TrendingKeywords keywords={trendingKeywords} />
    )}
  </aside>
);
