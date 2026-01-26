import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const RISK_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#6b7280'];

interface RiskDistributionProps {
  riskLevels: Record<string, number>;
}

export function RiskDistribution({ riskLevels }: RiskDistributionProps) {
  const data = Object.entries(riskLevels).map(([risk, count]) => ({
    name: risk || 'Low',
    value: count
  }));

  return (
    <Card className="group relative lg:col-span-1 border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="relative pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-gray-100 text-base sm:text-lg">
          <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
          Risk Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="relative p-4 sm:p-6 pt-0">
        <div className="h-44 sm:h-52 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
