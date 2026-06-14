export const ADMIN_ROLES = ["ADMIN", "ORDERS_MANAGER", "IMAGE_CREATOR"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface AdminSessionPayload {
  userId: string;
  username: string;
  role: AdminRole;
}

export function isAdminRole(value: string): value is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(value);
}

export function canAccessOrders(role: AdminRole): boolean {
  return role === "ADMIN" || role === "ORDERS_MANAGER";
}

export function canAccessGenerator(role: AdminRole): boolean {
  return role === "ADMIN" || role === "IMAGE_CREATOR";
}

export function getDefaultAdminRedirect(role: AdminRole): string {
  if (role === "ORDERS_MANAGER") {
    return "/admin/objednavky/nova";
  }
  if (role === "IMAGE_CREATOR") {
    return "/admin/generator";
  }
  return "/admin";
}
