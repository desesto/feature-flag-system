import CreateFeatureFlag from "@/components/createFeatureFlag/CreateFeatureFlag.component";
import GetFeatureFlags from "@/components/getFeatureFlags/GetFeatureFlags.component";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const response = await fetch(`http://localhost:3000/api/users/${id}`, {
        cache: "no-store",
    });
    const user = await response.json();


    return (
        <div className="mt-10 flex flex-col">
            <div className="flex justify-center gap-4">
                <h1>
                    Velkommen <strong>{user.name}</strong>
                </h1>
            </div>



            <div className=" mt-8 mx-auto">
                <h2 className="font-bold text-pink-400 text-2xl">Feature Flags:</h2>
                <div className="mt-10">
                <CreateFeatureFlag userId={user.id} />
                </div>
                <GetFeatureFlags userId={user.id}/>
            </div>
        </div>
    )
}