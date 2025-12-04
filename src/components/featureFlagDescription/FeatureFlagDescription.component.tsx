"use client";

import {useState} from "react";
import type {EditFeatureFlagDto, FeatureFlagDto} from "@/lib/dto/featureFlag.dto";
import {useRouter} from "next/navigation";
import {parseApiDates, toLocalDatetimeString} from "@/lib/utils/dateConversion";

type FeatureFlagDescriptionProps = {
    readonly featureFlagId: number
    readonly children?: React.ReactNode
}

export default function FeatureFlagDescription({featureFlagId, children}: FeatureFlagDescriptionProps) {
    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);
    const [form, setForm] = useState<EditFeatureFlagDto>({
        id: featureFlagId,
        user_id: 0,
        name: '',
        is_active: false,
        description: '',
        strategy: 'NO_STRATEGY',
        whitelist_id: null,
        whitelist: null,
        start_time: null,
        end_time: null,
    });
    const [timestamps, setTimestamps] = useState<{ created_at: Date | null; updated_at: Date | null }>({
        created_at: null,
        updated_at: null,
    });

    const handleOpen = async () => {
        const response = await fetch(`http://localhost:3000/api/feature-flags/${featureFlagId}`);
        const data = await response.json();

        const featureFlag: FeatureFlagDto = parseApiDates(data);

        setForm({
            id: featureFlag.id,
            user_id: featureFlag.user_id,
            name: featureFlag.name,
            is_active: featureFlag.is_active,
            description: featureFlag.description,
            strategy: featureFlag.strategy ?? 'NO_STRATEGY',
            whitelist_id: featureFlag.whitelist_id ?? null,
            whitelist: featureFlag.whitelist ?? null,
            start_time: featureFlag.start_time ?? null,
            end_time: featureFlag.end_time ?? null,
        });
        setTimestamps({
            created_at: featureFlag.created_at,
            updated_at: featureFlag.updated_at,
        });
        console.log("FEATURE FLAG:", {...form})

        setShowPopup(true);
    };


    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                className="text-blue-400 text-left hover:underline cursor-pointer bg-transparent border-none p-0 m-0"
            >
                {children}
            </button>

            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 backdrop-blur-xxs">
                    <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg max-w-lg w-full relative">
                        <button
                            onClick={() => setShowPopup(false)}
                            type="button"
                            className="absolute top-3 right-3 hover:text-gray-300 text-xl font-bold"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-4">Information om feature flag</h2>

                        <label className="flex flex-col gap-1 mb-3">
                            Navn:
                            <input
                                type="text"
                                value={form.name}
                                readOnly
                                className="p-2 rounded border bg-transparent cursor-default"
                            />
                        </label>

                        <div className="flex items-start justify-between mb-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-300">Aktiv status:</span>
                                <span
                                    className={ form.is_active
                                            ? "text-green-400 font-semibold"
                                            : "text-red-400 font-semibold"
                                         }
                                    >
                                    {form.is_active ? "Aktiv" : "Inaktiv"}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => router.push(`/feature-flags/history/${featureFlagId}`)}
                                className="px-4 py-2 mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                Se historik
                            </button>
                        </div>


                        <label className="flex flex-col gap-1 mb-3">
                            Beskrivelse:
                            <input
                                type="text"
                                value={form.description}
                                readOnly
                                className="p-2 rounded border bg-transparent cursor-default"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Strategi:
                            <input
                                value={form.strategy ?? 'NO_STRATEGY'}
                                readOnly
                                className="p-2 rounded border bg-transparent cursor-default"
                            />
                        </label>
                        {form.strategy === 'CANARY' && (
                            <label className="flex flex-col gap-1 mb-3">
                                Whitelist:
                                <input
                                    value={form.whitelist?.name ?? 'Ingen whitelist valgt'}
                                    readOnly
                                    className="p-2 rounded border bg-transparent cursor-default"
                                />
                            </label>
                        )}

                        <label className="flex flex-col gap-1 mb-3">
                            Feature flagget skal slåes til:
                            <input
                                type="datetime-local"
                                value={toLocalDatetimeString(form.start_time)}
                                readOnly
                                className="p-2 rounded border bg-transparent cursor-default"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Feature flagget skal slåes fra:
                            <input
                                type="datetime-local"
                                value={toLocalDatetimeString(form.end_time)}
                                readOnly
                                className="p-2 rounded border bg-transparent cursor-default"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Oprettet den:
                            <input
                                type="datetime-local"
                                value={toLocalDatetimeString(timestamps.created_at)}
                                readOnly
                                className="p-2 rounded border bg-transparent cursor-default"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Opdateret den:
                            <input
                                type="datetime-local"
                                value={toLocalDatetimeString(timestamps.updated_at)}
                                readOnly
                                className="p-2 rounded border bg-transparent cursor-default"
                            />
                        </label>
                    </div>
                </div>
            )}
        </>
    );
}