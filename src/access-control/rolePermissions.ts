import { PERMISSIONS } from "./permissions";

export const ROLE_PERMISSIONS: Record<string, PERMISSIONS[]> = {
    "Developer": [
        PERMISSIONS.FEATURE_CREATE,
        PERMISSIONS.FEATURE_EDIT,
        PERMISSIONS.FEATURE_DELETE,
        PERMISSIONS.FEATURE_TOGGLE,
        PERMISSIONS.FEATURE_TOGGLE,
    ],
    "Product-Manager": [
        PERMISSIONS.FEATURE_TOGGLE,
    ],
    "Non-Technical-User": [],
};

