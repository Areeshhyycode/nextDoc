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
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderHover: "hover:border-blue-200 dark:hover:border-blue-800",
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
    <div className="mb-8" data-testid="starter-options">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Get started with a template
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Choose a starter template or start typing
        </p>
      </div>
      <div className="flex justify-center gap-6">
        {templateOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.type}
              onClick={() => onSelectTemplate(option.type)}
              className={`group flex flex-col items-center gap-4 p-8 w-56 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl ${option.borderHover} hover:shadow-xl hover:-translate-y-1 transition-all duration-200`}
              data-testid={option.testId}
            >
              {/* Icon */}
              <div className={`p-4 rounded-xl ${option.iconBg} group-hover:scale-110 transition-all duration-200`}>
                <Icon className={`h-8 w-8 ${option.iconColor} transition-colors duration-200`} />
              </div>

              {/* Text content */}
              <div className="text-center">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-1.5">
                  {option.label}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
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
