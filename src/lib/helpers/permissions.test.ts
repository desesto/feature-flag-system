import { describe, it, expect } from 'vitest';
import {
    hasPermission,
    getRolePermissions,
    canLogin
} from '@/lib/helpers/permissions';
import { PERMISSIONS } from '@/access-control/permissions';

describe('permissions helpers', () => {
    describe('hasPermission', () => {
        it('should return true when role has permission', () => {
            expect(hasPermission('Developer', PERMISSIONS.FEATURE_CREATE)).toBe(true);
        });

        it('should return false when role does not have permission', () => {
            expect(hasPermission('Non-Technical-User', PERMISSIONS.FEATURE_CREATE)).toBe(false);
        });

        it('should return false for empty role', () => {
            expect(hasPermission('', PERMISSIONS.FEATURE_CREATE)).toBe(false);
        });

        it('should return false for invalid role', () => {
            expect(hasPermission('InvalidRole', PERMISSIONS.FEATURE_CREATE)).toBe(false);
        });

        it('should return false when role is undefined', () => {
            expect(hasPermission(undefined as any, PERMISSIONS.FEATURE_CREATE)).toBe(false);
        });
    });

    describe('getRolePermissions', () => {
        it('should return permissions array for Developer', () => {
            const permissions = getRolePermissions('Developer');
            expect(Array.isArray(permissions)).toBe(true);
            expect(permissions.length).toBeGreaterThan(0);
            expect(permissions).toContain(PERMISSIONS.FEATURE_CREATE);
        });

        it('should return permissions array for Product-Manager', () => {
            const permissions = getRolePermissions('Product-Manager');
            expect(Array.isArray(permissions)).toBe(true);
            expect(permissions.length).toBeGreaterThan(0);
        });

        it('should return permissions array for Non-Technical-User', () => {
            const permissions = getRolePermissions('Non-Technical-User');
            expect(Array.isArray(permissions)).toBe(true);
        });

        it('should return empty array for invalid role', () => {
            const permissions = getRolePermissions('InvalidRole');
            expect(permissions).toEqual([]);
        });

        it('should return empty array for empty string', () => {
            const permissions = getRolePermissions('');
            expect(permissions).toEqual([]);
        });
    });

    describe('canLogin', () => {
        it('should return true for roles with permissions', () => {
            expect(canLogin('Developer')).toBe(true);
            expect(canLogin('Product-Manager')).toBe(true);
        });

        it('should return true for Non-Technical-User if they have any permissions', () => {
            const hasPermissions = getRolePermissions('Non-Technical-User').length > 0;
            expect(canLogin('Non-Technical-User')).toBe(hasPermissions);
        });

        it('should return false for roles without permissions', () => {
            expect(canLogin('InvalidRole')).toBe(false);
        });

        it('should return false for empty role', () => {
            expect(canLogin('')).toBe(false);
        });
    });
});