import GetFeatureFlagHistory from "@/components/featureFlagHistory/GetFeatureFlagHistory.component";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const historyId = Number(id);

    const response = await fetch(`http://localhost:3000/api/feature-flags/${id}`, {
        cache: "no-store",
    });

    if (!response.ok) {
        return <div className="p-6 text-red-400">Feature flag ikke fundet</div>;
    }

    const featureFlag = await response.json();

    return (
        <div className="mt-10 flex flex-col px-6">
            <div className="flex justify-center gap-4 mb-8">
                <h1 className="text-3xl">
                    FeatureFlag Name: {featureFlag.name}
                </h1>
            </div>

            <div className="mx-auto w-full max-w-6xl">
                <div className="text-2xl">
                    History:
                </div>
                <GetFeatureFlagHistory featureFlagId={historyId} />
            </div>
        </div>
    );
}