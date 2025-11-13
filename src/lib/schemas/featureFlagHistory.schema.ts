import {array, nullable, number, object, picklist, string} from "valibot";

export const FeatureFlagHistorySchema = object ({
    id: number(),
    feature_flag_id: number(),
    user_id: number(),
    user_name: nullable(string()),
    timestamp: string(),
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