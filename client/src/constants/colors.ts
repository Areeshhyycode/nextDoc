// Shared color mappings used across the application

// Status colors - used in project-table, executive-overview, department-table, enhanced-department-page/table
export const STATUS_COLORS: Record<string, string> = {
  'Not Started': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Reviewing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Blocked': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Design Approval Needed': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Temporary Hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

// Status config with label and variant for Badge component
export const STATUS_CONFIG: Record<string, { label: string; variant: "default"; className: string }> = {
  'Completed': { label: 'Completed', variant: 'default', className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' },
  'In Progress': { label: 'In Progress', variant: 'default', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' },
  'Not Started': { label: 'Not Started', variant: 'default', className: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400' },
  'Blocked': { label: 'Blocked', variant: 'default', className: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' },
  'Reviewing': { label: 'Reviewing', variant: 'default', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' },
  'Design Approval Needed': { label: 'Design Approval Needed', variant: 'default', className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' },
  'Temporary Hold': { label: 'Temporary Hold', variant: 'default', className: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400' },
};

// Risk colors - used in enhanced-department-page/table
export const RISK_COLORS: Record<string, string> = {
  'Low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'High': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  '': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  'none': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

// Stage colors - used in enhanced-department-page/table
export const STAGE_COLORS: Record<string, string> = {
  'Others': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  'Pre-Event': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Day Of': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'Post-Event': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'During Event': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

// Department colors - used in project-table
export const DEPARTMENT_COLORS: Record<string, { label: string; className: string }> = {
  'Product': { label: 'Product', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' },
  'Design': { label: 'Design', className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' },
  'Dev': { label: 'Dev', className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' },
  'Marketing & Sales': { label: 'Marketing & Sales', className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400' },
  'Bug Hunting Campaign': { label: 'Bug Hunting Campaign', className: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' },
};

// Helper functions
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || STATUS_COLORS['Not Started'];
}

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG['Not Started'];
}

export function getRiskColor(risk: string): string {
  return RISK_COLORS[risk] || RISK_COLORS['none'];
}

export function getStageColor(stage: string): string {
  return STAGE_COLORS[stage] || STAGE_COLORS['Others'];
}

export function getDepartmentColor(department: string) {
  return DEPARTMENT_COLORS[department] || DEPARTMENT_COLORS['Product'];
}

// Status HEX colors - used in calendar events
export const STATUS_HEX_COLORS: Record<string, string> = {
  'Not Started': '#6B7280',
  'In Progress': '#3B82F6',
  'Reviewing': '#F59E0B',
  'Completed': '#10B981',
  'Blocked': '#EF4444',
  'Design Approval Needed': '#8B5CF6',
  'Temporary Hold': '#F97316'
};

export function getStatusHexColor(status: string): string {
  return STATUS_HEX_COLORS[status] || STATUS_HEX_COLORS['Not Started'];
}
