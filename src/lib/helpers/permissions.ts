import {PERMISSIONS} from "@/access-control/permissions";
import {ROLE, ROLE_PERMISSIONS} from "@/access-control/role";

export function hasPermission(role: string | ROLE, permission: PERMISSIONS): boolean {
    const permissions = ROLE_PERMISSIONS[role as ROLE];
    if (!permissions) return false;
    return permissions.includes(permission);
}


export function getRolePermissions(role: string | ROLE): PERMISSIONS[] {
    return ROLE_PERMISSIONS[role as ROLE] ?? [];
}


export function canLogin(role: string | ROLE): boolean {
    return getRolePermissions(role).length > 0;
}