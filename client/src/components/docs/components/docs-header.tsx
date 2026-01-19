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
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Documents
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
          Create and manage your project documents
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="h-11 px-5 gap-2 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
          onClick={onImport}
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="h-11 px-5 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 font-medium"
            >
              <Plus className="h-4 w-4" />
              New Document
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1">
            {/* Doc Option */}
            <DropdownMenuItem onClick={() => onCreateDoc('blank')} className="gap-3 py-2 px-3 rounded-md">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Doc</span>
            </DropdownMenuItem>

            {/* Import Option */}
            <DropdownMenuItem onClick={onImport} className="gap-3 py-2 px-3 rounded-md">
              <Upload className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Import</span>
            </DropdownMenuItem>

            {/* Templates Section */}
            <div className="px-3 py-2 mt-1">
              <p className="text-xs text-gray-400 font-medium">Templates</p>
            </div>

            <DropdownMenuItem onClick={() => onCreateDoc('project_overview')} className="gap-3 py-2 px-3 rounded-md">
              <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                <img src="/projectView.png" alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm">Project Overview</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onCreateDoc('meeting_notes')} className="gap-3 py-2 px-3 rounded-md">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Meeting Notes</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-3 py-2 px-3 rounded-md">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Browse Templates</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
