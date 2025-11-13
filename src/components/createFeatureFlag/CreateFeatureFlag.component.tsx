"use client";

import {useRouter} from "next/navigation";
import {useState} from 'react';
import {validateFeatureFlagInput} from "@/components/createFeatureFlag/validateFeatureFlagInput.component";
import {CreateFeatureFlagDto} from "@/lib/dto/featureFlag.dto";

type CreateFeatureFlagProps = {
    readonly userId: number
}

export default function CreateFeatureFlag({userId}: CreateFeatureFlagProps) {
    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);
    const [showDateError, setShowDateError] = useState(false);

    const [form, setForm] = useState<CreateFeatureFlagDto>({
        user_id: userId,
        name: '',
        is_active: false,
        description: '',
        strategy: 'NO_STRATEGY',
        start_time: null,
        end_time: null,
    });

    const handleOpen = () => {

        setForm({
            user_id: userId,
            name: '',
            is_active: false,
            description: '',
            strategy: 'NO_STRATEGY',
            start_time: null,
            end_time: null,
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
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
            cache: "no-store",
        });
        const user = await response.json();
        try {
            await fetch('/api/featureFlags', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...form, user_email: user.email}),
            });

            setShowPopup(false)
            router.refresh()
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
                                    checked={form.is_active}
                                    onChange={(event) =>
                                        setForm({...form, is_active: event.target.checked})
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
                                    setForm({...form, strategy: event.target.value as "NO_STRATEGY" | "FUTURE_IMPLEMENTATIONS"})
                                }
                                className="p-2 rounded border"
                            >
                                <option value="NO_STRATEGY">NO_STRATEGY</option>
                                <option value="FUTURE_IMPLEMENTATIONS">
                                    FUTURE_IMPLEMENTATIONS
                                </option>
                            </select>
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Feature flagget skal slåes til:
                            <input
                                type="datetime-local"
                                value={form.start_time ?? ''}
                                onChange={(event) =>
                                    setForm({...form, start_time: event.target.value})
                                }
                                className="p-2 rounded border"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Feature flagget skal slåes fra:
                            <input
                                type="datetime-local"
                                value={form.end_time ?? ''}
                                onChange={(event) =>
                                    setForm({...form, end_time: event.target.value})
                                }
                                className="p-2 rounded border"
                            />
                            {showDateError && (
                                <p className="text-red-400">
                                    Sluttidspunkt skal være efter starttidspunkt og begge skal angives
                                </p>
                            )}
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