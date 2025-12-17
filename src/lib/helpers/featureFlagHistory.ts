import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { featureFlagHistoryTable } from "@/db/schema";
import type {FeatureFlagDto} from "@/lib/dto/featureFlag.dto";
import {toISOStringIfDate} from "@/lib/utils/dateConversion";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export async function logFeatureFlagCreated(
    featureFlagId: number,
    userId: number
): Promise<void> {
    await db.insert(featureFlagHistoryTable).values({
        featureFlagId: featureFlagId,
        userId: userId,
        actionType: 'CREATED',
        changedFields: null,
        oldValues: null,
        newValues: null,
    });
}

export async function logFeatureFlagDeleted(
    featureFlagId: number,
    userId: number
): Promise<void> {
    await db.insert(featureFlagHistoryTable).values({
        featureFlagId: featureFlagId,
        userId: userId,
        actionType: 'DELETED',
        changedFields: null,
        oldValues: null,
        newValues: null,
    });
}

const ignore_keys = ['id', 'userId', 'whiteList', 'createdAt', 'updatedAt', 'deletedAt'];

export async function logFeatureFlagUpdated(
    featureFlagId: number,
    userId: number,
    oldFlag: FeatureFlagDto,
    newFlag: FeatureFlagDto
): Promise<void> {
    const changedFields: string[] = [];
    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    for (const key of Object.keys(newFlag)) {
        if (ignore_keys.includes(key)) {
            continue;
        }

        if (key === 'whiteListId') {
            if (oldFlag.whiteListId !== newFlag.whiteListId) {
                changedFields.push('whiteList');
                oldValues.whitelist = oldFlag.whiteList?.name ?? null;
                newValues.whitelist = newFlag.whiteList?.name ?? null;
            }
            continue;
        }

        const oldValue: any = (oldFlag as any)[key];
        const newValue: any = (newFlag as any)[key];

        const oldString = toISOStringIfDate(oldValue);
        const newString = toISOStringIfDate(newValue);

        if (oldString !== newString) {
            changedFields.push(key);
            oldValues[key] = oldString;
            newValues[key] = newString;
        }
    }

    if (changedFields.length === 0) {
        return;
    }

    const actionType = determineUpdateActionType(changedFields, newFlag.isActive);

    await db.insert(featureFlagHistoryTable).values({
        featureFlagId: featureFlagId,
        userId: userId,
        actionType: actionType,
        changedFields: JSON.stringify(changedFields),
        oldValues: JSON.stringify(oldValues),
        newValues: JSON.stringify(newValues),
    });
}

export function determineUpdateActionType(
    changedFields: string[],
    newIsActive?: boolean
): 'UPDATED' | 'ACTIVATED' | 'DEACTIVATED' {
    if (changedFields.length === 1 && changedFields[0] === 'isActive') {
        return newIsActive ? 'ACTIVATED' : 'DEACTIVATED';
    }
    return 'UPDATED';
}

