import { Cell, Pie, PieChart, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

interface MoodDistributionChartProps {
  moodDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
}

export const MoodDistributionChart = ({
  moodDistribution,
}: MoodDistributionChartProps) => {
  const hasData = moodDistribution && moodDistribution.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-48 w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={5}
                >
                  {moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value} entries`]}
                      className="bg-popover text-popover-foreground border-border"
                    />
                  }
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconSize={10}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center">
              <p className="text-muted-foreground">
                No mood data to display yet.
              </p>
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
