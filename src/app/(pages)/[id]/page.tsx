import CreateFeatureFlag from "@/components/createFeatureFlag/CreateFeatureFlag.component";
import GetFeatureFlags from "@/components/getFeatureFlags/GetFeatureFlags.component";


export default async function Page({params}: {params: {id: string}}) {

    const response = await fetch(`http://localhost:3000/api/users/${params.id}`);

    const user = await response.json();


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
                <GetFeatureFlags/>
            </div>
        </div>
    )
}