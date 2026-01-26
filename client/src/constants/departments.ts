export const DEPARTMENTS = [
  { value: "all", label: "All Departments" },
  { value: "Product", label: "Product" },
  { value: "Design", label: "Design" },
  { value: "Dev", label: "Development" },
  { value: "Marketing & Sales", label: "Marketing & Sales" },
  { value: "Bug Hunting Campaign", label: "Bug Hunting" }
] as const;

export type DepartmentValue = typeof DEPARTMENTS[number]['value'];
