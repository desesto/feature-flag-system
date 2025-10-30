'use client';

import {useState} from 'react';
import {useRouter} from "next/navigation";
import {localDate} from "drizzle-orm/gel-core";

 type CreateFeatureFlagProps = {
     readonly userId: string
 }

export default function CreateFeatureFlag({userId}: CreateFeatureFlagProps) {
    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);
    const now = new Date().toISOString().slice(0, 16);

    const [form, setForm] = useState({
        user_id: userId,
        name: '',
        is_active: false,
        description: '',
        strategy: '',
        start_time: '',
        end_time: '',
        created_at: now,
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

            const newFlag = await response.json();
            setShowPopup(false)
            router.push(`/mainPage/${userId}`);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowPopup(true)}
                    className="border border-white bg-white text-black rounded-4xl cursor-pointer p-1"
            >
                Opret feature flag
            </button>
            {showPopup && (
                <div className="font-bold">Lav feature flag
                    <label className="flex items-center gap-2 m-2 text-white"> Navn:
                        <input
                            type="text"
                            value={form.name}
                            onChange={(event) => setForm({...form, name: event.target.value})}
                            className="m-2 p-2 rounded border border-white text-white"
                        />
                    </label>
                    <label className="flex items-center gap-2 m-2 text-white">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(event) => setForm({...form, is_active: event.target.checked})}
                            className="w-4 h-4"
                        />
                        Aktiv
                    </label>
                    <label className="flex items-center gap-2 m-2 text-white"> Beskrivelse:
                        <input
                            type="text"
                            value={form.description}
                            onChange={(event) => setForm({...form, description: event.target.value})}
                            className="m-2 p-2 rounded border border-white text-white"
                        />
                    </label>
                    <label className="flex items-center gap-2 m-2 text-white"> Strategi:
                        <input
                            type="text"
                            value={form.strategy}
                            onChange={(event) => setForm({...form, strategy: event.target.value})}
                            className="m-2 p-2 rounded border border-white text-white"
                        />
                    </label>
                    <label className="flex items-center gap-2 m-2 text-white"> Feature flagget skal slåes til:
                        <input
                            type="datetime-local"
                            value={form.start_time}
                            onChange={(event) => setForm({...form, start_time: event.target.value})}
                            className="m-2 p-2 rounded border border-white text-white"
                        />
                    </label>
                    <label className="flex items-center gap-2 m-2 text-white"> Feature flagget skal slåes fra:
                        <input
                            type="datetime-local"
                            value={form.end_time}
                            onChange={(event) => setForm({...form, end_time: event.target.value})}
                            className="m-2 p-2 rounded border border-white text-white"
                        />
                    </label>
                    <label className="flex items-center gap-2 m-2 text-white"> Oprettet den:
                        <input
                            type="datetime-local"
                            value={form.created_at}
                            readOnly
                            className="m-2 p-2 rounded border border-white text-white"
                        />
                    </label>
                    <label className="flex items-center gap-2 m-2 text-white"> Opdateret den:
                        <input
                            type="datetime-local"
                            value={form.updated_at}
                            readOnly
                            className="m-2 p-2 rounded border border-white text-white"
                        />
                    </label>
                    <label className="flex items-center gap-2 m-2 text-white"> Slettet den:
                        <input
                            type="datetime-local"
                            value={form.deleted_at}
                            readOnly
                            className="m-2 p-2 rounded border border-white text-white"
                        />
                    </label>
                    <button onClick={handleSubmit} className="border border-white rounded-4xl cursor-pointer p-2"
                    >Submit</button>
                </div>
            )}
        </>
    );
}