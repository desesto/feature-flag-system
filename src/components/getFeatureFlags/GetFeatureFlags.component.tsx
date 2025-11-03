export default async function GetFeatureFlags() {
    const response2 = await fetch(`http://localhost:3000/api/featureFlags`);

    const featureFlags = await response2.json();

    return (
        <ul className="border-white border-2 rounded-md p-2 mt-1 max-w-lg">
            {featureFlags.map((flag: any) => (
                <li className="border-b-2 border-gray-500 p-1" key={flag.id}>
                    <strong>{flag.name}</strong> - {flag.is_active ? "Active" : "Inactive"}
                    {flag.description && `: ${flag.description}`}{" "}
                    <em>(Created by {flag.user_name})</em>
                </li>
            ))}
        </ul>
    );
}