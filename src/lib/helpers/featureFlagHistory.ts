// src/lib/helpers/featureFlagHistory.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { featureFlagHistoryTable } from "@/db/schema";
import {EditFeatureFlagDto, FeatureFlagDto} from "@/lib/dto/featureFlag.dto";
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
        feature_flag_id: featureFlagId,
        user_id: userId,
        action_type: 'CREATED',
        changed_fields: null,
        old_values: null,
        new_values: null,
    });
}

export async function logFeatureFlagDeleted(
    featureFlagId: number,
    userId: number
): Promise<void> {
    await db.insert(featureFlagHistoryTable).values({
        feature_flag_id: featureFlagId,
        user_id: userId,
        action_type: 'DELETED',
        changed_fields: null,
        old_values: null,
        new_values: null,
    });
}

const ignore_keys = ['id', 'user_id', 'whitelist', 'created_at', 'updated_at', 'deleted_at'];

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

        if (key === 'whitelist_id') {
            if (oldFlag.whitelist_id !== newFlag.whitelist_id) {
                changedFields.push('whitelist');
                oldValues.whitelist = oldFlag.whitelist?.name ?? null;
                newValues.whitelist = newFlag.whitelist?.name ?? null;
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

    const actionType = determineUpdateActionType(changedFields, newFlag.is_active);

    await db.insert(featureFlagHistoryTable).values({
        feature_flag_id: featureFlagId,
        user_id: userId,
        action_type: actionType,
        changed_fields: JSON.stringify(changedFields),
        old_values: JSON.stringify(oldValues),
        new_values: JSON.stringify(newValues),
    });
}

export function determineUpdateActionType(
    changedFields: string[],
    newIsActive?: boolean
): 'UPDATED' | 'ACTIVATED' | 'DEACTIVATED' {
    if (changedFields.length === 1 && changedFields[0] === 'is_active') {
        return newIsActive ? 'ACTIVATED' : 'DEACTIVATED';
    }
    return 'UPDATED';
}

