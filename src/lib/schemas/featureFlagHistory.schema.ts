import {array, date, nullable, number, object, picklist, string} from "valibot";
import {UserSchema} from "@/lib/schemas/user.schema";

export const FeatureFlagHistorySchema = object ({
    id: number(),
    featureFlagId: number(),
    userId: number(),
    user: UserSchema,
    timestamp: date(),
    actionType: picklist(['CREATED', 'UPDATED', 'DELETED', 'ACTIVATED', 'DEACTIVATED']),
    changedFields: nullable(string()),
    oldValues: nullable(string()),
    newValues: nullable(string()),

});


export const CreateFeatureFlagHistorySchema = object ({
    featureFlagId: number(),
    userId: number(),
    actionType: picklist(['CREATED', 'UPDATED', 'DELETED', 'ACTIVATED', 'DEACTIVATED']),
    changedFields: nullable(string()),
    oldValues: nullable(string()),
    newValues: nullable(string()),
});

export const GetFeatureFlagHistoriesSchema = array(FeatureFlagHistorySchema);