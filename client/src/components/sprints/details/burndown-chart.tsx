import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BurndownDataPoint {
  day: string;
  ideal: number;
  actual: number | null;
}

interface BurndownChartProps {
  data: BurndownDataPoint[];
}

export function BurndownChart({ data }: BurndownChartProps) {
  if (data.length <= 1) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Burndown Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="#9CA3AF"
                strokeDasharray="5 5"
                name="Ideal"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function generateBurndownData(
  totalEffort: number,
  completedEffort: number,
  totalDays: number,
  daysPassed: number
): BurndownDataPoint[] {
  const burndownData: BurndownDataPoint[] = [];
  const idealBurnRate = totalEffort / totalDays;

  for (let day = 0; day <= Math.min(daysPassed, totalDays); day++) {
    const idealRemaining = Math.max(0, totalEffort - (idealBurnRate * day));
    const actualRemaining = day === daysPassed ? (totalEffort - completedEffort) : idealRemaining;

    burndownData.push({
      day: `Day ${day}`,
      ideal: idealRemaining,
      actual: day <= daysPassed ? actualRemaining : null
    });
  }

  return burndownData;
}
