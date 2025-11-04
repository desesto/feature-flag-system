/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import FeatureFlagToggle from "@/components/updateFeatureFlag/FeatureFlagToggle.component";
import DeleteFeatureFlagButtonComponent from "@/components/deleteFeatureFlag/DeleteFeatureFlagButton.component";

export default async function GetFeatureFlags() {
    const response2 = await fetch(`http://localhost:3000/api/featureFlags`);

    const featureFlags = await response2.json();

    return (
        <div className="border-white border-2 rounded-md mt-4">
            <div className="grid grid-cols-[minmax(200px,2fr)_200px_80px_100px] gap-4 p-3 font-bold border-b-2 border-gray-400 bg-gray-800">
                <span>Name</span>
                <span className="text-left">Strategy</span>
                <span>Active</span>
                <span>Actions</span>
            </div>

            <ul className="p-2">
                {featureFlags.map((flag: any) => (
                    <li
                        className="border-b-2 border-gray-500 p-3 grid grid-cols-[minmax(100px,2fr)_220px_80px_100px] gap-2 items-center even:bg-neutral-800"
                        key={flag.id}
                    >
                        <strong>{flag.name}</strong>
                        <span className="text-gray-300 text-left">{flag.strategy || '—'}</span>
                        <FeatureFlagToggle id={flag.id} isActive={flag.is_active} />
                        <div className="flex gap-2 pr-1">
                            <button className="text-blue-400 bg-black hover:underline outline px-1">Edit</button>
                            <DeleteFeatureFlagButtonComponent id={flag.id} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}