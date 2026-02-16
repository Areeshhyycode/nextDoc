import { Table2, FileText, Users } from "lucide-react";

type TemplateType = "blank" | "meeting" | "todo" | "table" | "project_overview";

interface StarterOptionsProps {
  onSelectTemplate: (type: TemplateType) => void;
}

const templateOptions = [
  {
    type: "table" as TemplateType,
    icon: Table2,
    label: "Table",
    description: "Organize data in rows and columns",
    iconBg: "bg-teal-50 dark:bg-teal-900/20",
    iconColor: "text-teal-600 dark:text-teal-400",
    borderHover: "hover:border-teal-200 dark:hover:border-teal-800",
    testId: "starter-table",
  },
  {
    type: "project_overview" as TemplateType,
    icon: FileText,
    label: "Project Overview",
    description: "Start with a project template",
    iconBg: "bg-violet-50 dark:bg-violet-900/20",
    iconColor: "text-violet-600 dark:text-violet-400",
    borderHover: "hover:border-violet-200 dark:hover:border-violet-800",
    testId: "starter-project-overview",
  },
  {
    type: "meeting" as TemplateType,
    icon: Users,
    label: "Meeting Notes",
    description: "Create structured meeting notes",
    iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-200 dark:hover:border-emerald-800",
    testId: "starter-meeting",
  },
];

export function StarterOptions({ onSelectTemplate }: StarterOptionsProps) {
  return (
    <div className="mb-4 sm:mb-8" data-testid="starter-options">
      <div className="text-center mb-4 sm:mb-8 px-2">
        <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1 sm:mb-2">
          Get started with a template
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Choose a starter template or start typing
        </p>
      </div>
      <div className="flex justify-center gap-3 sm:gap-6 flex-wrap px-2">
        {templateOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.type}
              onClick={() => onSelectTemplate(option.type)}
              className={`group flex flex-col items-center gap-2 sm:gap-4 p-4 sm:p-8 w-32 sm:w-56 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg sm:rounded-xl ${option.borderHover} hover:shadow-xl hover:-translate-y-1 transition-all duration-200`}
              data-testid={option.testId}
            >
              {/* Icon */}
              <div className={`p-2 sm:p-4 rounded-lg sm:rounded-xl ${option.iconBg} group-hover:scale-110 transition-all duration-200`}>
                <Icon className={`h-5 w-5 sm:h-8 sm:w-8 ${option.iconColor} transition-colors duration-200`} />
              </div>

              {/* Text content */}
              <div className="text-center">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs sm:text-base mb-0.5 sm:mb-1.5">
                  {option.label}
                </p>
                <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
