import {getUserRole} from "@/lib/helpers/user";
import type {GetFeatureFlagsDto} from "@/lib/dto/featureFlag.dto";
import FeatureFlagList from "./FeatureFlagList.component";

type GetFeatureFlagsProps = {
    userId: number
};

export default async function GetFeatureFlags({ userId }: GetFeatureFlagsProps) {
    const response = await fetch(`http://localhost:3000/api/feature-flags`);
    const role = await getUserRole(userId);

    if (!response.ok) {
        throw new Error('Failed to fetch feature flags');
    }

    const featureFlags: GetFeatureFlagsDto = await response.json();

    return <FeatureFlagList featureFlags={featureFlags} userId={userId} userRole={role}/>;
}