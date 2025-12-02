import {array, date, nullable, number, object, picklist, string} from "valibot";
import {UserSchema} from "@/lib/schemas/user.schema";

export const FeatureFlagHistorySchema = object ({
    id: number(),
    feature_flag_id: number(),
    user_id: number(),
    user: UserSchema,
    timestamp: date(),
    action_type: picklist(['CREATED', 'UPDATED', 'DELETED', 'ACTIVATED', 'DEACTIVATED']),
    changed_fields: nullable(string()),
    old_values: nullable(string()),
    new_values: nullable(string()),

});


export const CreateFeatureFlagHistorySchema = object ({
    feature_flag_id: number(),
    user_id: number(),
    action_type: picklist(['CREATED', 'UPDATED', 'DELETED', 'ACTIVATED', 'DEACTIVATED']),
    changed_fields: nullable(string()),
    old_values: nullable(string()),
    new_values: nullable(string()),
});

export const GetFeatureFlagHistoriesSchema = array(FeatureFlagHistorySchema);