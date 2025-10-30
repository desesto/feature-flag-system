/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CreateUserPanel from './CreateUserPanel.component';

export default function CreateUserButton() {
    const [showPopup, setShowPopup] = useState(false);
    const router = useRouter();

    const handleSuccess = (userId: number) => {
        setShowPopup(false);
        router.push(`/mainPage/${userId}`);
    };

    const handleCancel = () => {
        setShowPopup(false);
    };

    return (
        <>
            <div className="text-sm mt-3">
                Hvis du ikke har en bruger endnu, kan du oprette en her.
            </div>
            <button
                onClick={() => setShowPopup(true)}
                className="border border-white bg-gray-800 hover:bg-cyan-500 font-bold text-whitefont-sans rounded-4xl cursor-pointer px-4 py-2 my-2"
            >
                Opret bruger
            </button>

            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <CreateUserPanel
                        SuccessAction={handleSuccess}
                        CancelAction={handleCancel}
                    />
                </div>
            )}
        </>
    );
}
