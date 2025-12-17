import type {FeatureFlagHistoryDto, GetFeatureFlagHistoriesDto} from "@/lib/dto/featureFlagHistory.dto";
import {parseApiDates, toLocalDatetimeString} from "@/lib/utils/dateConversion";

type GetFeatureFlagHistoryProps = {
    readonly featureFlagId: number;
};

export default async function GetFeatureFlagHistory({featureFlagId}:GetFeatureFlagHistoryProps) {
    const response = await fetch(`http://localhost:3000/api/feature-flag-histories/${featureFlagId}`,);

    if (!response.ok) {
        throw new Error('Failed to fetch history for featureflag');
    }

    const data = await response.json();


    const featureFlagHistories: GetFeatureFlagHistoriesDto = parseApiDates(data);

    if (featureFlagHistories.length === 0) {
        return <div className="text-gray-400 p-4">Ingen historik endnu</div>;
    }

    return (
        <div className="outline">
        <div className="grid grid-cols-3 gap-4 p-4 border-b-2 border-gray-400 bg-neutral-900 font-semibold">
            <span className="text-gray-300">Date</span>
            <span className="text-gray-300">Action</span>
            <span className="text-gray-300">User</span>
        </div>
        <ul className="p-2 border-white border-2 rounded-md mt-4">
            {featureFlagHistories.map((history : FeatureFlagHistoryDto) => (

                <li
                    className="border-b-2 border-gray-500 p-4 grid grid-cols-3 gap-2 items-center even:bg-neutral-800"
                    key={history.id}
                >
                    <span className="text-gray-400">Date: {toLocalDatetimeString(history.timestamp)}</span>
                    <span className={`font-semibold ${
                        history.actionType === 'CREATED' ? 'text-green-400' : 
                            history.actionType === 'ACTIVATED' ? 'text-blue-400' :
                                history.actionType === 'DEACTIVATED' ? 'text-orange-400' :
                                    history.actionType === 'DELETED' ? 'text-red-400' :
                                        'text-purple-400'
                    }`}>
                            {history.actionType}
                        </span>
                    <span className="text-gray-400">{history.user.name}</span>
                    {history.actionType !== 'CREATED' && history.actionType !==  'DELETED'  && (
                        <details className="px-4 pb-4 w full">
                            <summary className="cursor-pointer text-blue-400 hover:text-blue-300 text-sm">
                                Se detaljer
                            </summary>
                            <div className="mt-3 space-y-3">
                                {history.changedFields && (
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Ændrede felter:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {JSON.parse(history.changedFields).map((field: string) => (
                                                <span key={field} className="px-2 py-1 bg-gray-700 rounded text-xs">
                                                            {field}
                                                        </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-80">
                                    {history.oldValues && (
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Old:</div>
                                            <pre className="text-xs bg-gray-900 p-3 rounded overflow-auto min-w-[300] max-h-40">
                                                        {JSON.stringify(JSON.parse(history.oldValues), null, 2)}
                                                    </pre>
                                        </div>
                                    )}
                                    {history.newValues && (
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">New:</div>
                                            <pre className="text-xs bg-gray-900 p-3 rounded overflow-auto min-w-[300] max-h-40">
                                                        {JSON.stringify(JSON.parse(history.newValues), null, 2)}
                                                    </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </details>
                    )}
                </li>
            ))}
        </ul>
        </div>
    );

}
