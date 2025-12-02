"use client";

import {useRouter} from "next/navigation";
import {useState} from 'react';
import { CreateWhiteListDto } from "@/lib/dto/whiteList.dto";


export default function CreateWhiteList() {
    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);

    const [form, setForm] = useState<CreateWhiteListDto>({
        name: ""
    });

    const handleOpen = () => {
        setForm({
            name: ""
        });

        setShowPopup(true);
    };


    const handleSubmit = async () => {
        try {
            await fetch('/api/white-lists', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(form),
            });

            setShowPopup(false)
            router.refresh()
        } catch (err) {
            console.error('Error:', err);
        }
    };

    return (
        <div>
            <button
                type="button"
                onClick={() => handleOpen()}
                className="flex items-center max-w-prose text-left cursor-pointer"
            >
                <span className="border-2 text-green-400 min-w-8 min-h-8 font-bold flex items-center justify-center">+</span>
                <span className="p-4 font-bold text-gray-400">Create White List</span>
            </button>

            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 backdrop-blur-xxs">
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg max-w-lg w-full relative [color-scheme:dark]">
                        <h2 className="text-2xl font-bold mb-4 text-white">Opret White List</h2>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-white mb-2">Navn</label>
                            <input
                                type="text"
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm({...form, name: e.target.value})}
                                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowPopup(false)}
                                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                            >
                                Annuller
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSubmit()}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                            >
                                Opret
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}