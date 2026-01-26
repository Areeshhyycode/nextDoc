import { Card, CardContent } from "@/components/ui/card";

interface HeroStatProps {
  value: number | string;
  label: string;
  gradient: string;
}

function HeroStat({ value, label, gradient }: HeroStatProps) {
  return (
    <div className="text-center group/stat">
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-xl sm:rounded-2xl opacity-20 group-hover/stat:opacity-30 transition-opacity duration-300`} />
        <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6">
          <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 ${gradient.includes('emerald') ? 'text-emerald-600 dark:text-emerald-400' : gradient.includes('blue') ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {value}
          </div>
          <div className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium">{label}</div>
        </div>
      </div>
    </div>
  );
}

interface DashboardHeroProps {
  avgCompletionRate: number;
  activeMembers: number;
  overdueTasks: number;
}

export function DashboardHero({ avgCompletionRate, activeMembers, overdueTasks }: DashboardHeroProps) {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
      <Card className="relative border-0 shadow-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
        <CardContent className="p-5 sm:p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="text-center lg:text-left space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                Live Dashboard
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent leading-tight">
                Cyberbay PMO
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                Comprehensive project management dashboard driving operational excellence across all departments
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full lg:w-auto">
              <HeroStat value={`${avgCompletionRate}%`} label="Success Rate" gradient="from-emerald-400 to-green-500" />
              <HeroStat value={activeMembers} label="Active Teams" gradient="from-blue-400 to-indigo-500" />
              <HeroStat value={overdueTasks} label="Urgent Tasks" gradient="from-orange-400 to-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
