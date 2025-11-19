import type { RoleUser } from "@/types/user.type";

/**
 * Get button CSS class based on user role
 * @param roleCode - User's role code
 * @returns Button class name from index.css
 */
export const getRoleButtonClass = (roleCode?: RoleUser | string): string => {
  const roleClassMap: Record<string, string> = {
    admin: "btn-admin",
    lab_manager: "btn-lab-manager",
    lab_user: "btn-lab-user",
    service: "btn-service",
    consultant: "btn-admin", // Use admin style for consultant
    patient: "btn-patient",
  };

  return roleClassMap[roleCode || ""] || "btn-primary";
};

/**
 * Get badge CSS class based on user role
 * @param roleCode - User's role code
 * @returns Badge class name from index.css
 */
export const getRoleBadgeClass = (roleCode?: RoleUser | string): string => {
  const roleClassMap: Record<string, string> = {
    admin: "badge-admin",
    lab_manager: "badge-lab-manager",
    lab_user: "badge-lab-user",
    service: "badge-service",
    consultant: "badge-admin",
    patient: "badge-patient",
  };

  return roleClassMap[roleCode || ""] || "badge-admin";
};

/**
 * Get stat card CSS class based on user role
 * @param roleCode - User's role code
 * @returns Stat card class name from index.css
 */
export const getRoleStatCardClass = (roleCode?: RoleUser | string): string => {
  const roleClassMap: Record<string, string> = {
    admin: "stat-card-admin",
    lab_manager: "stat-card-lab-manager",
    lab_user: "stat-card-lab-user",
    service: "stat-card-service",
    consultant: "stat-card-admin",
    patient: "stat-card-patient",
  };

  return roleClassMap[roleCode || ""] || "stat-card-admin";
};

/**
 * Get table header CSS class based on user role
 * @param roleCode - User's role code
 * @returns Table header class name from index.css
 */
export const getRoleTableHeaderClass = (
  roleCode?: RoleUser | string
): string => {
  const roleClassMap: Record<string, string> = {
    admin: "table-header-admin",
    lab_manager: "table-header-lab-manager",
    lab_user: "table-header-lab-user",
    service: "table-header-service",
    consultant: "table-header-admin",
    patient: "table-header-patient",
  };

  return roleClassMap[roleCode || ""] || "table-header-admin";
};

/**
 * Get card CSS class based on user role
 * @param roleCode - User's role code
 * @returns Card class name from index.css
 */
export const getRoleCardClass = (roleCode?: RoleUser | string): string => {
  const roleClassMap: Record<string, string> = {
    admin: "card-admin",
    lab_manager: "card-lab-manager",
    lab_user: "card-lab-user",
    service: "card-service",
    consultant: "card-admin",
    patient: "card-patient",
  };

  return roleClassMap[roleCode || ""] || "card-admin";
};
