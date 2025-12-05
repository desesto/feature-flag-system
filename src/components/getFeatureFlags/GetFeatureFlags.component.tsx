import DeleteFeatureFlagButtonComponent from "@/components/deleteFeatureFlag/DeleteFeatureFlagButton.component";
import EditFeatureFlag from "@/components/editFeatureFlag/EditFeatureFlag.component";
import FeatureFlagDescription from "@/components/featureFlagDescription/FeatureFlagDescription.component";
import FilterFeatureFlags from "@/components/filterFeatureFlags/FilterFeatureFlags.component";
import FeatureFlagToggle from "@/components/updateFeatureFlag/FeatureFlagToggle.component";
import type {GetFeatureFlagsDto} from "@/lib/dto/featureFlag.dto";
import {getUserRole} from "@/lib/helpers/user";

type GetFeatureFlagsProps = {
    userId: number;
    searchParams: {
        filter?: string;
    };
};

export default async function GetFeatureFlags({ userId, searchParams }: GetFeatureFlagsProps) {
    const rawFilter = searchParams.filter ?? "all";
    const filters = rawFilter.split(",").filter(Boolean);

    const response = await fetch(`http://localhost:3000/api/feature-flags`);
    const role = await getUserRole(userId);

    if (!response.ok) {
        throw new Error('Failed to fetch feature flags');
    }

    const featureFlags: GetFeatureFlagsDto = await response.json();

    const filteredFlags = featureFlags.filter(flag => {
        if (filters.length === 0 || filters.includes("all")) return true;

        return filters.some(f => {
            if (f === "active") return flag.is_active === true;
            if (f === "inactive") return flag.is_active === false;
            if (f === "canary") return flag.strategy === "CANARY";
            if (f === "no_strategy") return flag.strategy === "NO_STRATEGY";
            return false;
        });
    });

    return (
        <div className="border-white border-2 rounded-md mt-4">

            <FilterFeatureFlags/>
            <div
                className="grid grid-cols-[minmax(200px,2fr)_200px_80px_100px] gap-4 p-3 font-bold border-b-2 border-gray-400 bg-gray-800">
                <span>Name</span>
                <span className="text-left">Strategy</span>
                <span>Active</span>
                <span>Actions</span>
            </div>

            <ul className="p-2">
                {filteredFlags.map((flag) => (
                    <li
                        className="border-b-2 border-gray-500 p-3 grid grid-cols-[minmax(100px,2fr)_220px_80px_100px] gap-2 items-center even:bg-neutral-800"
                        key={flag.id}
                    >
                        <FeatureFlagDescription featureFlagId={flag.id}>
                            {flag.name}
                        </FeatureFlagDescription>
                        <span className="text-gray-300 text-left">{flag.strategy || '—'}</span>
                        <FeatureFlagToggle featureFlagId={flag.id} isActive={flag.is_active} userId={userId} />
                        <div className="flex gap-2 pr-1">
                            <EditFeatureFlag featureFlagId={flag.id} userId={userId} userRole={role}/>
                            <DeleteFeatureFlagButtonComponent id={flag.id} userId={userId} userRole={role} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}