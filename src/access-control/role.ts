import { PERMISSIONS } from "./permissions";

export enum ROLE {
    DEVELOPER = "Developer",
    PRODUCT_MANAGER = "Product-Manager",
    NON_TECHNICAL_USER = "Non-Technical-User"
}

export const ROLE_PERMISSIONS: Record<ROLE, PERMISSIONS[]> = {
    [ROLE.DEVELOPER]: [
        PERMISSIONS.FEATURE_CREATE,
        PERMISSIONS.FEATURE_EDIT,
        PERMISSIONS.FEATURE_DELETE,
        PERMISSIONS.FEATURE_TOGGLE,
    ],
    [ROLE.PRODUCT_MANAGER]: [
        PERMISSIONS.FEATURE_TOGGLE,
    ],
    [ROLE.NON_TECHNICAL_USER]: [],
};

