import type {PERMISSIONS} from "@/access-control/permissions";
import {ROLE_PERMISSIONS} from "@/access-control/rolePermissions";

export function hasPermission(role: string, permission: PERMISSIONS): boolean {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;
    return permissions.includes(permission);
}


export function getRolePermissions(role: string): PERMISSIONS[] {
    return ROLE_PERMISSIONS[role] ?? [];
}


export function canLogin(role: string): boolean {
    return getRolePermissions(role).length > 0;
}