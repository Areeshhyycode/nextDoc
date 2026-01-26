// Shared team members list used across the application
// Used in task-modal, jira-style-task-modal, goal-modal, sprint-modal, calendar

export const TEAM_MEMBERS = [
  "Zara A",
  "Shaharyar Asgher",
  "Tom Austin",
  "Quang (Brett) Ngo",
  "Dillon Bong",
  "Thuy (Sweet) Phan Thanh",
  "heidi fung",
  "Sam L",
  "Hinora"
] as const;

export type TeamMemberName = typeof TEAM_MEMBERS[number];

// For select dropdowns with "All" option
export const TEAM_MEMBERS_OPTIONS = [
  { value: "all", label: "All Team Members" },
  ...TEAM_MEMBERS.map(name => ({ value: name, label: name }))
];
