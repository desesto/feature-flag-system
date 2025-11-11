import {number, object, picklist, string} from "valibot";

export const FeatureFlagHistorySchema = object ({
    id: number(),
    feature_flag_id: number(),
    user_id: number(),
    timestamp: string(),
    action_type: picklist(['CREATED', 'UPDATED', 'DELETED', 'ACTIVATED', 'DEACTIVATED']),

});


export const CreateFeatureFlagHistorySchema = object ({
    feature_flag_id: number(),
    user_id: number(),
    action_type: picklist(['CREATED', 'UPDATED', 'DELETED', 'ACTIVATED', 'DEACTIVATED']),
});

export const getFeatureFlagHistorySchema = object ({
    feature_flag_id: number(),

});