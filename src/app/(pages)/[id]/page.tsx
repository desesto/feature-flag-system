import CreateFeatureFlag from "@/components/createFeatureFlag/CreateFeatureFlag.component";


export default async function Page({params}: {params: {id: string}}) {

    const response = await fetch(`http://localhost:3000/api/users/${params.id}`
    );
    const response2 = await fetch(`http://localhost:3000/api/featureFlags`);

    const user = await response.json();

    const featureFlags = await response2.json();

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-center text-center gap-4">
                <h1>
                    Velkommen <strong>{user.name}</strong>
                </h1>
                <CreateFeatureFlag userId={user.id.toString()} />
            </div>

            <div className="flex flex-col mt-8 ml-5">
                <h2 className="font-bold">Feature Flags:</h2>
                <ul className="border-white border-2 rounded-md p-2 mt-1 max-w-lg">
                    {featureFlags.map((flag: any) => (
                        <li className="border-b-2 border-gray-500 p-1" key={flag.id}>
                            <strong>{flag.name}</strong> - {flag.is_active ? "Active" : "Inactive"}
                            {flag.description && `: ${flag.description}`}{" "}
                            <em>(Created by {flag.user_name})</em>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}