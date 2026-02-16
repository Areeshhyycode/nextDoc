import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, FileText, Upload, Users, BookOpen, ChevronDown } from "lucide-react";

interface DocsHeaderProps {
  onCreateDoc: (category: 'blank' | 'meeting_notes' | 'project_overview') => void;
  onImport: () => void;
}

export function DocsHeader({ onCreateDoc, onImport }: DocsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 sm:mb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Documents
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Create and manage your docs
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-9 px-3 gap-1.5 text-sm font-medium border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={onImport}
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Import</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="h-9 px-3.5 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New Doc</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 p-1">
            <DropdownMenuItem onClick={() => onCreateDoc('blank')} className="gap-2.5 py-2 px-3 rounded-md cursor-pointer">
              <FileText className="h-4 w-4 text-teal-500" />
              <span className="text-sm">Blank Document</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onImport} className="gap-2.5 py-2 px-3 rounded-md cursor-pointer">
              <Upload className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Import File</span>
            </DropdownMenuItem>

            <div className="px-3 py-1.5 mt-1">
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Templates</p>
            </div>

            <DropdownMenuItem onClick={() => onCreateDoc('project_overview')} className="gap-2.5 py-2 px-3 rounded-md cursor-pointer">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Project Overview</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onCreateDoc('meeting_notes')} className="gap-2.5 py-2 px-3 rounded-md cursor-pointer">
              <Users className="h-4 w-4 text-amber-500" />
              <span className="text-sm">Meeting Notes</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
