"use client";

import {useState} from "react";
import {validateFeatureFlagInput} from "@/components/createFeatureFlag/validateFeatureFlagInput.component";
import type {EditFeatureFlagDto, FeatureFlagDto} from "@/lib/dto/featureFlag.dto";
import {hasAccessToEditFeatureFlag} from "@/access-control/featureFlagAccess";
import WhitelistSelector from "@/components/whitelist/WhitelistSelector.component";
import {
    fromLocalDatetimeString,
    parseApiDates,
    serializeDates,
    toLocalDatetimeString
} from "@/lib/utils/dateConversion";

type EditFeatureFlagProps = {
    readonly featureFlagId: number
    readonly userId: number
    readonly userRole: string
}

export default function EditFeatureFlag({featureFlagId, userId, userRole}: EditFeatureFlagProps) {
    const [showPopup, setShowPopup] = useState(false);
    const [showDateError, setShowDateError] = useState(false);
    const [form, setForm] = useState<EditFeatureFlagDto>({
        id: featureFlagId,
        userId: userId,
        name: '',
        isActive: false,
        description: '',
        strategy: 'NO_STRATEGY',
        whiteListId: null,
        startTime: null,
        endTime: null,
        path: null
    });
    const [timestamps, setTimestamps] = useState<{ createdAt: Date | null; updatedAt: Date | null }>({
        createdAt: null,
        updatedAt: null,
    });

    const canEdit = hasAccessToEditFeatureFlag(userRole)

    const handleOpen = async () => {

        const response = await fetch(`http://localhost:3000/api/feature-flags/${featureFlagId}`);

        const data = await response.json();

        const featureFlag: FeatureFlagDto = parseApiDates(data);

        setForm({
            id: featureFlag.id,
            userId: userId,
            name: featureFlag.name,
            isActive: featureFlag.isActive,
            description: featureFlag.description,
            strategy: featureFlag.strategy ?? 'NO_STRATEGY',
            whiteListId: featureFlag.whiteListId ?? null,
            startTime: featureFlag.startTime ?? null,
            endTime: featureFlag.endTime ?? null,
            path: featureFlag.path ?? null,
        });
        setTimestamps({
            createdAt: featureFlag.createdAt,
            updatedAt: featureFlag.updatedAt,
        });

        setShowDateError(false)
        setShowPopup(true);
    };

    const handleSubmit = async () => {
        const validationError = validateFeatureFlagInput(form);
        if (validationError) {
            setShowDateError(true)
            return;
        }

        try {
            const payload = serializeDates(form);

            await fetch(`http://localhost:3000/api/feature-flags/${featureFlagId}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            setShowPopup(false)
            window.location.reload()
        } catch (err) {
            console.error('Error:', err);
        }
    };

    return (
        <>
            <div>
                <button
                    onClick={() => handleOpen()}
                    type="button"
                    disabled={!canEdit}
                    className={`px-1 ${
                        canEdit
                            ? "text-blue-400 bg-black hover:underline outline"
                            : "text-gray-400 cursor-not-allowed opacity-50"
                    }`}>Edit
                </button>
            </div>
            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 backdrop-blur-xxs">
                    <div
                        className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg max-w-md w-full text-sm leading-tight relative [color-scheme:dark]">
                        <button
                            onClick={() => setShowPopup(false)}
                            type="button"
                            className="absolute top-3 right-3 hover:text-gray-300 text-xl font-bold"
                        >
                            x
                        </button>

                        <h2 className="text-xl font-bold mb-4">Redigér feature flag</h2>

                        <label className="flex flex-col gap-1 mb-3">
                            Navn:
                            <input
                                type="text"
                                value={form.name}
                                onChange={(event) => setForm({...form, name: event.target.value})}
                                className="p-2 rounded border"
                            />
                        </label>

                        <label className="flex items-center gap-2 mb-3">
                            Aktiv
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(event) =>
                                        setForm({...form, isActive: event.target.checked})
                                    }
                                    className="sr-only peer"
                                />
                                <div
                                    className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-600 transition-colors"></div>
                                <div
                                    className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                            </div>
                        </label>


                        <label className="flex flex-col gap-1 mb-3">
                            Beskrivelse:
                            <textarea
                                value={form.description}
                                onChange={(event) =>
                                    setForm({...form, description: event.target.value})
                                }
                                className="p-2 rounded border resize-vertical"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Strategi:
                            <select
                                value={form.strategy ?? 'NO_STRATEGY'}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        strategy: event.target.value as "NO_STRATEGY" | "CANARY" | "FUTURE_IMPLEMENTATIONS"
                                    })
                                }
                                className="p-2 rounded border"
                            >
                                <option value="NO_STRATEGY">NO_STRATEGY</option>
                                <option value="CANARY">CANARY</option>
                                <option value="FUTURE_IMPLEMENTATIONS">FUTURE_IMPLEMENTATIONS</option>
                            </select>
                        </label>
                        {form.strategy === 'CANARY' && (
                            <WhitelistSelector
                                currentWhitelistId={form.whiteListId ?? null}
                                onWhitelistChange={(whitelistId) => setForm({...form, whiteListId: whitelistId})}
                            />
                        )}


                        <label className="flex flex-col gap-1 mb-3">
                            Feature flagget skal slåes til:
                            <input
                                type="datetime-local"
                                value={toLocalDatetimeString(form.startTime)}
                                onChange={(e) => setForm({
                                    ...form,
                                    startTime: fromLocalDatetimeString(e.target.value)
                                })}
                                className="p-2 rounded border"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Feature flagget skal slåes fra:
                            <input
                                type="datetime-local"
                                value={toLocalDatetimeString(form.endTime)}
                                onChange={(e) => setForm({
                                    ...form,
                                    endTime: fromLocalDatetimeString(e.target.value)
                                })}
                                className="p-2 rounded border"
                            />
                            {showDateError && (
                                <p className="text-red-400">
                                    Sluttidspunkt skal være efter starttidspunkt og begge skal angives
                                </p>
                            )}
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Oprettet den:
                            <input
                                type="datetime-local"
                                value={toLocalDatetimeString(timestamps.createdAt)}
                                readOnly
                                className="p-2 rounded border bg-gray-800 cursor-default"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Opdateret den:
                            <input
                                type="datetime-local"
                                value={toLocalDatetimeString(timestamps.updatedAt)}
                                readOnly
                                className="p-2 rounded border bg-gray-800 cursor-default"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Path:
                            <input
                                type="text"
                                value={form.path?.join(" → ") ?? ""}
                                readOnly
                                className="p-2 rounded border bg-transparent cursor-default"
                            />
                        </label>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowPopup(false)}
                                type="button"
                                className="border border-gray-400 text-gray-300 rounded-lg px-4 py-2 hover:bg-gray-800"
                            >
                                Annuller
                            </button>
                            <button
                                onClick={handleSubmit}
                                type="button"
                                className="border rounded-lg px-4 py-2 hover:bg-white hover:text-black"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}