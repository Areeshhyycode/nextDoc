// Core CRUD
export { getAllProjectsHandler } from "./getAllProjects";
export { getProjectHandler } from "./getProject";
export { createProjectHandler } from "./createProject";
export { updateProjectHandler } from "./updateProject";
export { deleteProjectHandler } from "./deleteProject";

// Dependencies
export { getDependenciesHandler, validateDependenciesHandler } from "./dependencies";

// Schedule
export { scheduleProjectHandler } from "./schedule";

// Tasks
export { getProjectTasksHandler, createProjectTaskHandler, updateProjectTaskHandler } from "./tasks";

// Budgets (nested under project)
export { getProjectBudgetsHandler, createProjectBudgetHandler, deleteProjectBudgetHandler } from "./budgets";

// Costs (nested under project)
export { getProjectCostsHandler, createProjectCostHandler, deleteProjectCostHandler } from "./costs";

// Status Updates (direct path router)
export { getStatusUpdatesHandler, createStatusUpdateHandler } from "./statusUpdates";

// Budgets (direct path router)
export { getBudgetsDirectHandler, createBudgetDirectHandler } from "./budgetsDirect";

// Costs (direct path router)
export { getCostsDirectHandler, createCostDirectHandler, updateCostDirectHandler, deleteCostDirectHandler } from "./costsDirect";

// Activities (direct path router)
export { getProjectActivitiesHandler, createProjectActivityHandler } from "./activities";

// Attachments (direct path router)
export { getProjectAttachmentsHandler, deleteProjectAttachmentHandler } from "./attachments";
