"use client";

import {useRouter} from "next/navigation";
import {useState} from 'react';
import {validateFeatureFlagInput} from "@/components/createFeatureFlag/validateFeatureFlagInput.component";
import type {CreateFeatureFlagDto} from "@/lib/dto/featureFlag.dto";
import WhitelistSelector from "@/components/whitelist/WhitelistSelector.component";
import {fromLocalDatetimeString, serializeDates, toLocalDatetimeString} from "@/lib/utils/dateConversion";

type CreateFeatureFlagProps = {
    readonly userId: number
}

export default function CreateFeatureFlag({userId}: CreateFeatureFlagProps) {
    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);
    const [showDateError, setShowDateError] = useState(false);
    const [finishedPath, setFinishedPath] = useState<string[]>([]);
    const [currentPathInput, setCurrentPathInput] = useState<string>("");

    const [form, setForm] = useState<CreateFeatureFlagDto>({
        userId: userId,
        name: '',
        isActive: false,
        description: '',
        strategy: 'NO_STRATEGY',
        whiteListId: null,
        startTime: null,
        endTime: null,
        path: null,
    });

    const handleOpen = () => {
        setForm({
            userId: userId,
            name: '',
            isActive: false,
            description: '',
            strategy: 'NO_STRATEGY',
            whiteListId: null,
            startTime: null,
            endTime: null,
            path: null,
        });
        setShowDateError(false)
        setFinishedPath([]);
        setCurrentPathInput("");
        setShowPopup(true);
    };

    const handleSubmit = async () => {
        const pathForForm = [...finishedPath, currentPathInput].filter(Boolean);
        const formWithPath = {
            ...form,
            path: pathForForm.length ? pathForForm : null,
        };

        const validationError = validateFeatureFlagInput(formWithPath);
        if (validationError) {
            if (validationError.field === "dates") {
                setShowDateError(true);
            } else {
                alert(validationError.message);
            }
            return;
        }

        console.log("Payload being sent:", formWithPath);

        try {
            const payload = serializeDates(formWithPath);
            console.log("Serialized payload:", payload);

            const res = await fetch('/api/feature-flags', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            console.log("Response:", data);

            setShowPopup(false);
            router.refresh();
        } catch (err) {
            console.error('Error:', err);
        }
    };


    return (
        <>
            <button
                onClick={() => handleOpen()}
                type="button"
                className="border border-green-500 bg-gray-800 hover:bg-green-500 font-bold text-whitefont-sans rounded-full cursor-pointer px-4 py-2 my-2"
            >
                Opret feature flag
            </button>

            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 backdrop-blur-xxs">
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg max-w-lg w-full relative [color-scheme:dark]">
                        <button
                            onClick={() => setShowPopup(false)}
                            type="button"
                            className="absolute top-3 right-3 hover:text-gray-300 text-xl font-bold"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-4">Lav feature flag</h2>

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
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-600 transition-colors"></div>
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
                                value={form.strategy}
                                onChange={(event) =>
                                    setForm({...form, strategy: event.target.value as "NO_STRATEGY" | "CANARY" | "FUTURE_IMPLEMENTATIONS"})
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
                            Path (adskil segmenter med mellemrum eller komma):
                        <input
                            type="text"
                            value={currentPathInput}
                            onChange={(e) => setCurrentPathInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === " " || e.key === ",") {
                                    e.preventDefault();
                                    const segment = currentPathInput.trim();
                                    if (segment) {
                                        setFinishedPath(prev => [...prev, segment]);
                                    }
                                    setCurrentPathInput("");
                                }
                            }}
                            className="p-2 rounded border"
                        />
                        </label>

                        <div className="mt-1 text-gray-300">
                            {finishedPath.join(" → ")}
                        </div>

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