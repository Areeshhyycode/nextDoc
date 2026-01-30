import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, FileText, Upload, ChevronDown, Users, BookOpen } from "lucide-react";

interface DocsHeaderProps {
  onCreateDoc: (category: 'blank' | 'meeting_notes' | 'project_overview') => void;
  onImport: () => void;
}

export function DocsHeader({ onCreateDoc, onImport }: DocsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-7 lg:mb-9 pb-3 sm:pb-6 border-b-2 border-gray-200/60 dark:border-gray-700/40">
      <div className="space-y-0.5">
        <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent tracking-tight leading-tight">
          Documents
        </h1>
        <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
          Create and manage documents
        </p>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
        <Button
          size="sm"
          className="flex-1 sm:flex-none !h-8 sm:!h-10 px-2 sm:px-4 sm:!min-w-[100px] gap-1 sm:gap-1.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-400 dark:hover:border-gray-600 font-bold text-[11px] sm:text-sm shadow-sm hover:shadow-md active:scale-95 transition-all duration-200"
          onClick={onImport}
        >
          <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline sm:inline">Import</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="flex-1 sm:flex-none !h-8 sm:!h-10 px-2 sm:px-4 sm:!min-w-[100px] gap-1 sm:gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-0 text-white font-bold text-[11px] sm:text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>New Doc</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1">
            {/* Doc Option */}
            <DropdownMenuItem onClick={() => onCreateDoc('blank')} className="gap-3 py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Doc</span>
            </DropdownMenuItem>

            {/* Import Option */}
            <DropdownMenuItem onClick={onImport} className="gap-3 py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Upload className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Import</span>
            </DropdownMenuItem>

            {/* Templates Section */}
            <div className="px-3 py-2 mt-1">
              <p className="text-xs text-gray-400 font-medium">Templates</p>
            </div>

            <DropdownMenuItem onClick={() => onCreateDoc('project_overview')} className="gap-3 py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                <img src="/projectView.png" alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm">Project Overview</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onCreateDoc('meeting_notes')} className="gap-3 py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Meeting Notes</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-3 py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Browse Templates</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
