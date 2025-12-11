// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/db';
import type { FeatureFlagDto } from '@/lib/dto/featureFlag.dto';
import {checkFeatureFlagAccess} from "@/lib/helpers/featureFlagChecker";

// Mock the database
vi.mock('@/db', () => ({
    db: {
        query: {
            featureFlagsTable: {
                findFirst: vi.fn()
            }
        }
    }
}));

type FeatureFlagDtoWithWhitelistUsers = FeatureFlagDto & {
    whiteList?: {
        id: number;
        name: string;
        whiteListUsers?: Array<{
            id: number;
            whitelist_id: number;
            user_id: number;
            user: {
                id: number;
                name: string | null;
                email: string | null;
                role: string;
            };
        }>;
    } | null;
};

describe('checkFeatureFlagAccess', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return false when feature flag does not exist', async () => {
        vi.mocked(db.query.featureFlagsTable.findFirst).mockResolvedValue(undefined);

        const result = await checkFeatureFlagAccess('non-existent-flag');

        expect(result).toBe(false);
    });

    it('should return false when feature flag is not active', async () => {
        const mockFlag: FeatureFlagDtoWithWhitelistUsers = {
            id: 1,
            user_id: 100,
            name: 'inactive-flag',
            is_active: false,
            description: 'Inactive feature',
            strategy: 'NO_STRATEGY',
            white_list_id: null,
            start_time: null,
            end_time: null,
            created_at: null,
            updated_at: null,
            deleted_at: null
        };
        vi.mocked(db.query.featureFlagsTable.findFirst).mockResolvedValue(mockFlag as never);

        const result = await checkFeatureFlagAccess('inactive-flag');

        expect(result).toBe(false);
    });

    it('should return true with NO_STRATEGY', async () => {
        const mockFlag: FeatureFlagDtoWithWhitelistUsers = {
            id: 1,
            user_id: 100,
            name: 'open-flag',
            is_active: true,
            description: 'Open feature',
            strategy: 'NO_STRATEGY',
            white_list_id: null,
            start_time: null,
            end_time: null,
            created_at: null,
            updated_at: null,
            deleted_at: null
        };
        vi.mocked(db.query.featureFlagsTable.findFirst).mockResolvedValue(mockFlag as never);

        const result = await checkFeatureFlagAccess('open-flag');

        expect(result).toBe(true);
    });


    it('should return true with FUTURE_IMPLEMENTATIONS', async () => {
        const mockFlag: FeatureFlagDtoWithWhitelistUsers = {
            id: 1,
            user_id: 100,
            name: 'future-flag',
            is_active: true,
            description: 'Future feature',
            strategy: 'FUTURE_IMPLEMENTATIONS',
            white_list_id: null,
            start_time: null,
            end_time: null,
            created_at: null,
            updated_at: null,
            deleted_at: null
        };
        vi.mocked(db.query.featureFlagsTable.findFirst).mockResolvedValue(mockFlag as never);

        const result = await checkFeatureFlagAccess('future-flag');

        expect(result).toBe(true);
    });

    it('should return false for CANARY when userEmail is not provided', async () => {
        const mockFlag: FeatureFlagDtoWithWhitelistUsers = {
            id: 1,
            user_id: 100,
            name: 'canary-flag',
            is_active: true,
            description: 'Canary feature',
            strategy: 'CANARY',
            white_list_id: 1,
            start_time: null,
            end_time: null,
            created_at: null,
            updated_at: null,
            deleted_at: null,
            whiteList: {
                id: 1,
                name: 'Beta Testers',
                whiteListUsers: [
                    {
                        id: 1,
                        whitelist_id: 1,
                        user_id: 1,
                        user: {
                            id: 1,
                            name: 'Test User',
                            email: 'whitelisted@example.com',
                            role: 'Developer'
                        }
                    }
                ]
            }
        };
        vi.mocked(db.query.featureFlagsTable.findFirst).mockResolvedValue(mockFlag as never);

        const result = await checkFeatureFlagAccess('canary-flag');

        expect(result).toBe(false);
    });

    it('should return false for CANARY when whitelist is null', async () => {
        const mockFlag: FeatureFlagDtoWithWhitelistUsers = {
            id: 1,
            user_id: 100,
            name: 'canary-flag',
            is_active: true,
            description: 'Canary feature',
            strategy: 'CANARY',
            white_list_id: null,
            start_time: null,
            end_time: null,
            created_at: null,
            updated_at: null,
            deleted_at: null
        };
        vi.mocked(db.query.featureFlagsTable.findFirst).mockResolvedValue(mockFlag as never);

        const result = await checkFeatureFlagAccess('canary-flag', 'user@example.com');

        expect(result).toBe(false);
    });

    it('should return false for CANARY when whitelist is empty', async () => {
        const mockFlag: FeatureFlagDtoWithWhitelistUsers = {
            id: 1,
            user_id: 100,
            name: 'canary-flag',
            is_active: true,
            description: 'Canary feature',
            strategy: 'CANARY',
            white_list_id: 1,
            start_time: null,
            end_time: null,
            created_at: null,
            updated_at: null,
            deleted_at: null,
            whiteList: {
                id: 1,
                name: 'Empty Whitelist',
                whiteListUsers: []
            }
        };
        vi.mocked(db.query.featureFlagsTable.findFirst).mockResolvedValue(mockFlag as never);

        const result = await checkFeatureFlagAccess('canary-flag', 'user@example.com');

        expect(result).toBe(false);
    });

    it('should return true for CANARY when user email is in whitelist', async () => {
        const mockFlag: FeatureFlagDtoWithWhitelistUsers = {
            id: 1,
            user_id: 100,
            name: 'canary-flag',
            is_active: true,
            description: 'Canary feature',
            strategy: 'CANARY',
            white_list_id: 1,
            start_time: null,
            end_time: null,
            created_at: null,
            updated_at: null,
            deleted_at: null,
            whiteList: {
                id: 1,
                name: 'Beta Testers',
                whiteListUsers: [
                    {
                        id: 1,
                        whitelist_id: 1,
                        user_id: 1,
                        user: {
                            id: 1,
                            name: 'Test User',
                            email: 'whitelisted@example.com',
                            role: 'Developer'
                        }
                    }
                ]
            }
        };
        vi.mocked(db.query.featureFlagsTable.findFirst).mockResolvedValue(mockFlag as never);

        const result = await checkFeatureFlagAccess('canary-flag', 'whitelisted@example.com');

        expect(result).toBe(true);
    });

    it('should return false for CANARY when user email is not in whitelist', async () => {
        const mockFlag: FeatureFlagDtoWithWhitelistUsers = {
            id: 1,
            user_id: 100,
            name: 'canary-flag',
            is_active: true,
            description: 'Canary feature',
            strategy: 'CANARY',
            white_list_id: 1,
            start_time: null,
            end_time: null,
            created_at: null,
            updated_at: null,
            deleted_at: null,
            whiteList: {
                id: 1,
                name: 'Beta Testers',
                whiteListUsers: [
                    {
                        id: 1,
                        whitelist_id: 1,
                        user_id: 1,
                        user: {
                            id: 1,
                            name: 'Test User',
                            email: 'whitelisted@example.com',
                            role: 'Developer'
                        }
                    }
                ]
            }
        };
        vi.mocked(db.query.featureFlagsTable.findFirst).mockResolvedValue(mockFlag as never);

        const result = await checkFeatureFlagAccess('canary-flag', 'notwhitelisted@example.com');

        expect(result).toBe(false);
    });

    it('should return true for CANARY when user email matches one of many', async () => {
        const mockFlag: FeatureFlagDtoWithWhitelistUsers = {
            id: 1,
            user_id: 100,
            name: 'canary-flag',
            is_active: true,
            description: 'Canary feature',
            strategy: 'CANARY',
            white_list_id: 1,
            start_time: null,
            end_time: null,
            created_at: null,
            updated_at: null,
            deleted_at: null,
            whiteList: {
                id: 1,
                name: 'Beta Testers',
                whiteListUsers: [
                    {
                        id: 1,
                        whitelist_id: 1,
                        user_id: 1,
                        user: {
                            id: 1,
                            name: 'User One',
                            email: 'user1@example.com',
                            role: 'Developer'
                        }
                    },
                    {
                        id: 2,
                        whitelist_id: 1,
                        user_id: 2,
                        user: {
                            id: 2,
                            name: 'User Two',
                            email: 'user2@example.com',
                            role: 'Product-Manager'
                        }
                    },
                    {
                        id: 3,
                        whitelist_id: 1,
                        user_id: 3,
                        user: {
                            id: 3,
                            name: 'User Three',
                            email: 'user3@example.com',
                            role: 'Non-Technical-User'
                        }
                    }
                ]
            }
        };
        vi.mocked(db.query.featureFlagsTable.findFirst).mockResolvedValue(mockFlag as never);

        const result = await checkFeatureFlagAccess('canary-flag', 'user2@example.com');

        expect(result).toBe(true);
    });

    it('should filter out null emails in whitelist', async () => {
        const mockFlag: FeatureFlagDtoWithWhitelistUsers = {
            id: 1,
            user_id: 100,
            name: 'canary-flag',
            is_active: true,
            description: 'Canary feature',
            strategy: 'CANARY',
            white_list_id: 1,
            start_time: null,
            end_time: null,
            created_at: null,
            updated_at: null,
            deleted_at: null,
            whiteList: {
                id: 1,
                name: 'Beta Testers',
                whiteListUsers: [
                    {
                        id: 1,
                        whitelist_id: 1,
                        user_id: 1,
                        user: {
                            id: 1,
                            name: 'User With No Email',
                            email: null,
                            role: 'Developer'
                        }
                    },
                    {
                        id: 2,
                        whitelist_id: 1,
                        user_id: 2,
                        user: {
                            id: 2,
                            name: 'Valid User',
                            email: 'valid@example.com',
                            role: 'Developer'
                        }
                    }
                ]
            }
        };
        vi.mocked(db.query.featureFlagsTable.findFirst).mockResolvedValue(mockFlag as never);

        const result = await checkFeatureFlagAccess('canary-flag', 'valid@example.com');

        expect(result).toBe(true);
    });

});