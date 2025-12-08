import CreateFeatureFlag from "@/components/createFeatureFlag/CreateFeatureFlag.component";
import GetFeatureFlags from "@/components/getFeatureFlags/GetFeatureFlags.component";
import { hasAccessToCreateFeatureFlag, hasAccessToLogin } from "@/access-control/featureFlagAccess";
import { redirect } from "next/navigation";
import Tabs from "@/components/tabs/Tabs.component";
import UserIdSaver from "@/components/tabs/UserIdSaver.component";

export default async function Page({ params }: { params: { id: string };
}) {
    const { id } = params;

    const response = await fetch(`http://localhost:3000/api/users/${id}`, {
        cache: "no-store",
    });
    const user = await response.json();

    if (!hasAccessToLogin(user.role)) {
        redirect("/unauthorized");
    }

    return (
        <div className="mt-10 flex flex-col">
            <UserIdSaver userId={user.id} />
            <div className="absolute top-4 right-8 text-gray-400 text-sm">
                Logget ind som <strong className="text-white">{user.name}</strong>
            </div>

            <div className="mx-auto w-full max-w-7xl">
                <Tabs userId={user.id} />
            </div>
            <div className=" mt-8 mx-auto">
                <h2 className="font-bold text-pink-400 text-2xl">Feature Flags:</h2>
                <div className="mt-10">
                    {hasAccessToCreateFeatureFlag(user.role) && (
                        <CreateFeatureFlag userId={user.id} />
                    )}
                </div>
                <GetFeatureFlags userId={user.id}/>
            </div>
        </div>
    );
}