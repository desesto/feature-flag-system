import {UserDto} from "@/lib/dto/user.dto";


export type Permission =
    | 'feature_flags:create'
    | 'feature_flags:read'
    | 'feature_flags:update'
    | 'feature_flags:delete'
    | 'feature_flags:toggle'


const rolePermissions: Record<UserDto['role'], Permission[]> = {
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

export function hasPermission(user: UserDto, permission: Permission): boolean {

    const permissions = rolePermissions[user.role];

    return permissions.includes(permission);
}
