import { describe, it, expect } from 'vitest';
import {
    hasAccessToCreateFeatureFlag,
    hasAccessToEditFeatureFlag,
    hasAccessToDeleteFeatureFlag,
    hasAccessToToggleFeatureFlag,
    hasAccessToLogin
} from '@/access-control/featureFlagAccess';

describe('featureFlagAccess', () => {
    describe('hasAccessToCreateFeatureFlag', () => {
        it('should allow Developer to create feature flags', () => {
            expect(hasAccessToCreateFeatureFlag('Developer')).toBe(true);
        });

        it('should not allow Product-Manager to create feature flags', () => {
            expect(hasAccessToCreateFeatureFlag('Product-Manager')).toBe(false);
        });

        it('should not allow Non-Technical-User to create feature flags', () => {
            expect(hasAccessToCreateFeatureFlag('Non-Technical-User')).toBe(false);
        });

        it('should return false for invalid role', () => {
            expect(hasAccessToCreateFeatureFlag('InvalidRole')).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(hasAccessToCreateFeatureFlag('')).toBe(false);
        });
    });

    describe('hasAccessToEditFeatureFlag', () => {
        it('should allow Developer to edit feature flags', () => {
            expect(hasAccessToEditFeatureFlag('Developer')).toBe(true);
        });

        it('should not allow Product-Manager to edit feature flags', () => {
            expect(hasAccessToEditFeatureFlag('Product-Manager')).toBe(false);
        });

        it('should not allow Non-Technical-User to edit feature flags', () => {
            expect(hasAccessToEditFeatureFlag('Non-Technical-User')).toBe(false);
        });

        it('should return false for invalid role', () => {
            expect(hasAccessToEditFeatureFlag('InvalidRole')).toBe(false);
        });
    });

    describe('hasAccessToDeleteFeatureFlag', () => {
        it('should allow Developer to delete feature flags', () => {
            expect(hasAccessToDeleteFeatureFlag('Developer')).toBe(true);
        });

        it('should not allow Product-Manager to delete feature flags', () => {
            expect(hasAccessToDeleteFeatureFlag('Product-Manager')).toBe(false);
        });

        it('should not allow Non-Technical-User to delete feature flags', () => {
            expect(hasAccessToDeleteFeatureFlag('Non-Technical-User')).toBe(false);
        });

        it('should return false for invalid role', () => {
            expect(hasAccessToDeleteFeatureFlag('InvalidRole')).toBe(false);
        });
    });

    describe('hasAccessToToggleFeatureFlag', () => {
        it('should allow Developer to toggle feature flags', () => {
            expect(hasAccessToToggleFeatureFlag('Developer')).toBe(true);
        });

        it('should allow Product-Manager to toggle feature flags', () => {
            expect(hasAccessToToggleFeatureFlag('Product-Manager')).toBe(true);
        });

        it('should not allow Non-Technical-User to toggle feature flags', () => {
            expect(hasAccessToToggleFeatureFlag('Non-Technical-User')).toBe(false);
        });

        it('should return false for invalid role', () => {
            expect(hasAccessToToggleFeatureFlag('InvalidRole')).toBe(false);
        });
    });

    describe('hasAccessToLogin', () => {
        it('should allow Developer to login', () => {
            expect(hasAccessToLogin('Developer')).toBe(true);
        });

        it('should allow Product-Manager to login', () => {
            expect(hasAccessToLogin('Product-Manager')).toBe(true);
        });

        it('should not allow Non-Technical-User to login', () => {
            expect(hasAccessToLogin('Non-Technical-User')).toBe(false);
        });

        it('should not allow invalid role to login', () => {
            expect(hasAccessToLogin('InvalidRole')).toBe(false);
        });

        it('should not allow empty role to login', () => {
            expect(hasAccessToLogin('')).toBe(false);
        });
    });
});