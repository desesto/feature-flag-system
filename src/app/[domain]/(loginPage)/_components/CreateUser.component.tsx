/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client';

import { useState } from 'react';

export default function RegisterUserPopup() {
    const [showPopup, setShowPopup] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');

    const handleSubmit = () => {
        console.log({ username, email, role });
        // TODO: Add your submit logic here
        setShowPopup(false); // Close popup after submit
    };

    return (
        <>
            <button
                onClick={() => setShowPopup(true)}
                className="border border-white bg-white text-black rounded-4xl cursor-pointer"
            >
                Opret bruger
            </button>

            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center border-white justify-center">
                    <div className="bg-black p-4 rounded border border-white">
                        <h2 className="text-center text-white mb-4">Opret en bruger</h2>
                        <div className="text-white items-align-center flex flex-col">
                            Brugernavn <input
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            className="m-2 p-2 rounded border border-white text-white"
                        />
                            <br/>
                            Email <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="m-2 p-2 rounded border border-white text-white"
                        />
                        </div>
                        <div className="flex justify-center mt-4">
                            <button onClick={() => setShowPopup(false)} className="px-4 py-2 bg-gray-500 text-white rounded cursor-pointer">
                                Annuller
                            </button>
                            <button onClick={handleSubmit} className="px-4 py-2 bg-white text-black rounded cursor-pointer">
                                Opret
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}