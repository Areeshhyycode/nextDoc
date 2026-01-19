import { FileText, Calendar, ListTodo, Table2 } from "lucide-react";

type TemplateType = "blank" | "meeting" | "todo" | "table";

interface StarterOptionsProps {
  onSelectTemplate: (type: TemplateType) => void;
}

const templateOptions = [
  {
    type: "blank" as TemplateType,
    icon: FileText,
    label: "Blank Page",
    testId: "starter-blank",
  },
  {
    type: "meeting" as TemplateType,
    icon: Calendar,
    label: "Meeting Notes",
    testId: "starter-meeting",
  },
  {
    type: "todo" as TemplateType,
    icon: ListTodo,
    label: "To-Do List",
    testId: "starter-todo",
  },
  {
    type: "table" as TemplateType,
    icon: Table2,
    label: "Table",
    testId: "starter-table",
  },
];

export function StarterOptions({ onSelectTemplate }: StarterOptionsProps) {
  return (
    <div className="mb-8" data-testid="starter-options">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Getting started
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {templateOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.type}
              onClick={() => onSelectTemplate(option.type)}
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              data-testid={option.testId}
            >
              <Icon className="h-8 w-8 text-gray-400 group-hover:text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
