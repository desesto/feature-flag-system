import {getUserRole} from "@/lib/helpers/user";
import type {GetFeatureFlagsDto} from "@/lib/dto/featureFlag.dto";
import FeatureFlagList from "./FeatureFlagList.component";

export default async function GetFeatureFlags(props: { userId: number }) {
    const response = await fetch(`http://localhost:3000/api/feature-flags`);
    const role = await getUserRole(props.userId);

    if (!response.ok) {
        throw new Error('Failed to fetch feature flags');
    }

    const featureFlags: GetFeatureFlagsDto = await response.json();

    return <FeatureFlagList featureFlags={featureFlags} userId={props.userId} userRole={role} />;
}