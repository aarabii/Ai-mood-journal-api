import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
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
}: MoodDistributionChartProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Mood Distribution</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartContainer config={{}} className="h-48">
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
            >
              {moodDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  className="bg-popover text-popover-foreground border-border"
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </CardContent>
  </Card>
);
