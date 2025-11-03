'use client';


import {useState} from "react";

export default function FeatureFlagToggle({ id, isActive, }: { id: number; isActive: boolean;
}){

    const [active, setActive] = useState(isActive);


    const handleToggle = async () => {
        const optimisticState = !active;
        setActive(optimisticState);

        try {
            const response = await fetch(`/api/featureFlags`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error("Failed to update feature flag");
            }

            window.location.reload();

            } catch (error) {
                console.error("Error toggling feature flag:", error);
                setActive(!optimisticState);
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
        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
    </label>
);
}