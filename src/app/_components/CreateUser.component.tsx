/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client';

import { useState } from 'react';
import {useRouter} from "next/navigation";

export default function RegisterUserPopup() {
    const [showPopup, setShowPopup] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const router = useRouter();

    const handleSubmit = async () => {
        console.log({ username, email });

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: username,
                    email: email
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create user');
            }
            const newUser = await response.json()

            router.push(`/mainPage/${newUser.id}`);
        } catch (err) {
            console.error('Error:', err);
        }
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