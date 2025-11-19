import {PERMISSIONS} from "@/access-control/permissions";
import {hasPermission} from "@/lib/helpers/permissions";


export function hasAccessToCreateFeatureFlag(role: string): boolean {
    return hasPermission(role, PERMISSIONS.FEATURE_CREATE);
}

export function hasAccessToEditFeatureFlag(role: string): boolean {
    return hasPermission(role, PERMISSIONS.FEATURE_EDIT);
}

export function hasAccessToDeleteFeatureFlag(role: string): boolean {
    return hasPermission(role, PERMISSIONS.FEATURE_DELETE);
}

export function hasAccessToToggleFeatureFlag(role: string): boolean {
    return hasPermission(role, PERMISSIONS.FEATURE_TOGGLE);
}