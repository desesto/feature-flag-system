'use client';

import { useState } from 'react';
import CreateUserPanel from './CreateUserPanel.component';
import {useRouter} from "next/navigation";

export default function CreateUserButton() {
    const [showPopup, setShowPopup] = useState(false);
    const router = useRouter();

    const handleSuccess = () => {
        router.refresh()
        setShowPopup(false);
    };


    const handleCancel = () => {
        setShowPopup(false);
    };

    return (
        <>
            <button type="button"
                onClick={() => setShowPopup(true)}
                className="border border-white bg-gray-800 hover:bg-cyan-500 font-bold text-whitefont-sans rounded-4xl cursor-pointer px-4 py-2 my-2"
            >
                Opret bruger
            </button>

            {showPopup && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center">
                    <CreateUserPanel
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            )}
        </>
    );
}
