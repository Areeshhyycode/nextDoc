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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-10">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Documents
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
          Create and manage your project documents
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="!h-10 !w-[100px] gap-1.5 bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm"
          onClick={onImport}
        >
          <Upload className="h-4 w-4" />
          <span>Import</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="!h-10 !w-[100px] gap-1.5 bg-blue-600 hover:bg-blue-700 border border-blue-600 hover:border-blue-700 text-white font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New</span>
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
