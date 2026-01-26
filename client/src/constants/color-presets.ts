// Shared color presets for color pickers
// Used in create-team-modal, create-project-modal

export const COLOR_PRESETS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Red", value: "#EF4444" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Orange", value: "#F97316" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Teal", value: "#14B8A6" },
] as const;

// Simple array of color hex values (for simpler use cases)
export const COLOR_PRESET_VALUES = COLOR_PRESETS.map(c => c.value);

// Default color
export const DEFAULT_COLOR = "#3B82F6";
