import type {User} from "@/types/user";

export type Permission =
    | 'feature_flags:create'
    | 'feature_flags:read'
    | 'feature_flags:update'
    | 'feature_flags:delete'
    | 'feature_flags:toggle'


const rolePermissions: Record<User['role'], Permission[]> = {
    'Developer': [
        'feature_flags:create',
        'feature_flags:update',
        'feature_flags:delete',
        'feature_flags:toggle'
    ],
    'Product-Manager': [
        'feature_flags:toggle'
    ]
}

export function hasPermission(user: User, permission: Permission): boolean {

    const permissions = rolePermissions[user.role];

    return permissions.includes(permission);
}
