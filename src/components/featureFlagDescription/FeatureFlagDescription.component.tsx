"use client";

import {useState} from "react";
import type {EditFeatureFlagDto, FeatureFlagDto} from "@/lib/dto/featureFlag.dto";

type FeatureFlagDescriptionProps = {
    readonly featureFlagId: number
    readonly children?: React.ReactNode
}

export default function FeatureFlagDescription({featureFlagId, children}: FeatureFlagDescriptionProps) {
    const [showPopup, setShowPopup] = useState(false);
    const [form, setForm] = useState<EditFeatureFlagDto>({
        id: featureFlagId,
        user_id: 0,
        name: '',
        is_active: false,
        description: '',
        strategy: 'NO_STRATEGY',
        start_time: '',
        end_time: '',
    });
    const [timestamps, setTimestamps] = useState<{ created_at: string; updated_at: string }>({
        created_at: '',
        updated_at: '',
    });

    const handleOpen = async () => {
        const response = await fetch(`http://localhost:3000/api/featureFlags/${featureFlagId}`);

        const featureFlag: FeatureFlagDto = await response.json();

        const toLocalISOString = (dateString: string | null) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            const tzOffset = date.getTimezoneOffset() * 60000;
            const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
            return localISOTime;
        };

        setForm({
            id: featureFlag.id,
            user_id: featureFlag.user_id,
            name: featureFlag.name,
            is_active: featureFlag.is_active,
            description: featureFlag.description,
            strategy: featureFlag.strategy ?? 'NO_STRATEGY',
            start_time: featureFlag.start_time ?? null,
            end_time: featureFlag.end_time ?? null,
        });
        setTimestamps({
            created_at: toLocalISOString(featureFlag.created_at) ?? '',
            updated_at: toLocalISOString(featureFlag.updated_at) ?? '',
        });
        console.log("FEATURE FLAG:", {...form})

        setShowPopup(true);
    };


    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                className="text-blue-400 hover:underline cursor-pointer bg-transparent border-none p-0 m-0"
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

                        <div className="flex flex-col gap-1 mb-3">
                            <span className="text-gray-300">Aktiv status:</span>
                            <span
                                className={
                                    form.is_active
                                        ? "text-green-400 font-semibold"
                                        : "text-red-400 font-semibold"
                                }
                            >
                                {form.is_active ? "Aktiv" : "Inaktiv"}
                            </span>
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

                        <label className="flex flex-col gap-1 mb-3">
                            Feature flagget skal slåes til:
                            <input
                                type="datetime-local"
                                value={form.start_time?.slice(0, 16) ?? ""}
                                readOnly
                                className="p-2 rounded border bg-transparent"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Feature flagget skal slåes fra:
                            <input
                                type="datetime-local"
                                value={form.end_time?.slice(0, 16) ?? ""}
                                readOnly
                                className="p-2 rounded border bg-transparent"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Oprettet den:
                            <input
                                type="datetime-local"
                                value={timestamps.created_at.slice(0, 16)}
                                readOnly
                                className="p-2 rounded border bg-transparent"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Opdateret den:
                            <input
                                type="datetime-local"
                                value={timestamps.updated_at?.slice(0, 16) ?? ''}
                                readOnly
                                className="p-2 rounded border bg-transparent"
                            />
                        </label>
                    </div>
                </div>
            )}
        </>
    );
}