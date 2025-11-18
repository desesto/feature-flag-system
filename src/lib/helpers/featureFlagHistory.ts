// src/lib/helpers/featureFlagHistory.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { featureFlagHistoryTable } from "@/db/schema";
import {EditFeatureFlagDto, FeatureFlagDto} from "@/lib/dto/featureFlag.dto";

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

export async function logFeatureFlagUpdated(
    featureFlagId: number,
    userId: number,
    oldFlag: FeatureFlagDto,
    updates: EditFeatureFlagDto
): Promise<void> {
    const changedFields: string[] = [];
    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    (Object.keys(updates) as (keyof EditFeatureFlagDto)[]).forEach(key => {

        if (key === 'id' || key === 'user_id') {
            return;
        }

        const oldValue = oldFlag[key];
        const newValue = updates[key];

        if (oldValue !== newValue) {
            changedFields.push(key);
            oldValues[key] = oldValue;
            newValues[key] = newValue;
        }
    });

    if (changedFields.length === 0) {
        return;
    }

    const actionType = determineUpdateActionType(changedFields, updates.is_active);

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

