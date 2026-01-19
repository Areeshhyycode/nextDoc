import { EnhancedDepartmentPage } from "@/components/department/enhanced-department-page";

export default function ProductPage() {
  return (
    <EnhancedDepartmentPage
      department="Product"
      title="Product Management"
      description="Manage product development tasks, features, and roadmap items"
      color="bg-blue-600"
    />
  );
}