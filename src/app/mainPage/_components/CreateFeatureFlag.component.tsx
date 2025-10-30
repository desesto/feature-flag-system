'use client';

import {useState} from 'react';
import {useRouter} from "next/navigation";

type CreateFeatureFlagProps = {
    readonly userId: string
}

export default function CreateFeatureFlag({userId}: CreateFeatureFlagProps) {
    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);
    const time = new Date();
    const local = new Date(time.getTime() - time.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    const [form, setForm] = useState({
        user_id: userId,
        name: '',
        is_active: false,
        description: '',
        strategy: '',
        start_time: '',
        end_time: '',
        created_at: local,
        updated_at: '',
        deleted_at: ''
    });

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/featureFlags', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(form),
            });
            console.log('Form payload:', form);
            if (!response.ok) throw new Error('Failed to create feature flag');

            setForm({
                user_id: userId,
                name: '',
                is_active: false,
                description: '',
                strategy: '',
                start_time: '',
                end_time: '',
                created_at: local,
                updated_at: '',
                deleted_at: ''
            });

            setShowPopup(false)
            router.refresh()
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleClose = () => {
        setForm({
            user_id: userId,
            name: '',
            is_active: false,
            description: '',
            strategy: '',
            start_time: '',
            end_time: '',
            created_at: local,
            updated_at: '',
            deleted_at: ''
        });

        setShowPopup(false);
    };

    return (
        <>
            <button
                onClick={() => setShowPopup(true)}
                type="button"
                className="border border-white bg-white text-black rounded-4xl cursor-pointer p-1"
            >
                Opret feature flag
            </button>

            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 backdrop-blur-xxs">
                    <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg max-w-lg w-full relative">
                        <button
                            onClick={() => handleClose()}
                            type="button"
                            className="absolute top-3 right-3 text-white hover:text-gray-300 text-xl font-bold"
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
                                className="p-2 rounded border border-white bg-transparent text-white"
                            />
                        </label>

                        <label className="flex items-center gap-2 mb-3">
                            Aktiv
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(event) =>
                                        setForm({ ...form, is_active: event.target.checked })
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                            </div>
                        </label>


                        <label className="flex flex-col gap-1 mb-3">
                            Beskrivelse:
                            <input
                                type="text"
                                value={form.description}
                                onChange={(event) =>
                                    setForm({...form, description: event.target.value})
                                }
                                className="p-2 rounded border border-white bg-transparent text-white"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Strategi:
                            <select
                                value={form.strategy}
                                onChange={(event) =>
                                    setForm({...form, strategy: event.target.value})
                                }
                                className="p-2 rounded border border-white bg-transparent text-white"
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
                                value={form.start_time}
                                onChange={(event) =>
                                    setForm({...form, start_time: event.target.value})
                                }
                                className="p-2 rounded border border-white bg-transparent text-white"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Feature flagget skal slåes fra:
                            <input
                                type="datetime-local"
                                value={form.end_time}
                                onChange={(event) =>
                                    setForm({...form, end_time: event.target.value})
                                }
                                className="p-2 rounded border border-white bg-transparent text-white"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Oprettet den:
                            <input
                                type="datetime-local"
                                value={form.created_at}
                                readOnly
                                className="p-2 rounded border border-white bg-transparent text-white"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Opdateret den:
                            <input
                                type="datetime-local"
                                value={form.updated_at}
                                readOnly
                                className="p-2 rounded border border-white bg-transparent text-white"
                            />
                        </label>

                        <label className="flex flex-col gap-1 mb-3">
                            Slettet den:
                            <input
                                type="datetime-local"
                                value={form.deleted_at}
                                readOnly
                                className="p-2 rounded border border-white bg-transparent text-white"
                            />
                        </label>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => handleClose()}
                                type="button"
                                className="border border-gray-400 text-gray-300 rounded-lg px-4 py-2 hover:bg-gray-800"
                            >
                                Annuller
                            </button>
                            <button
                                onClick={handleSubmit}
                                type="button"
                                className="border border-white rounded-lg px-4 py-2 hover:bg-white hover:text-black"
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