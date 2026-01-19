import { EnhancedDepartmentPage } from "@/components/department/enhanced-department-page";

export default function DevPage() {
  return (
    <EnhancedDepartmentPage
      department="Dev"
      title="Development"
      description="Manage development tasks, sprints, and technical implementations"
      color="bg-green-600"
    />
  );
}