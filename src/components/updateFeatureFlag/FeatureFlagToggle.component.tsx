'use client';

import {useRouter} from "next/navigation";
import {useState} from "react";
import type {CreateFeatureFlagInput} from "@/types/featureFlag";

type FeatureFlagToggleProps = {
    readonly featureFlagId: number
    readonly isActive: boolean
    readonly flag: CreateFeatureFlagInput
}

export default function FeatureFlagToggle({featureFlagId, isActive, flag}: FeatureFlagToggleProps) {

    const router = useRouter();

    const [active, setActive] = useState(isActive);

    const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;
        setActive(newValue);

        try {
            const response = await fetch(`/api/featureFlags`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id: featureFlagId, is_active: newValue}),
            });

            if (!response.ok) {
                throw new Error("Failed to update feature flag");
            }

            router.refresh()

        } catch (error) {
            console.error("Error toggling feature flag:", error);
        }
    };

    return (
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={active}
                    onChange={handleToggle}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-600 transition-colors"></div>
                <div
                    className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
            </label>
    );
}