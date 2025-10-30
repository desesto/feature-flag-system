'use client';

import { useState } from 'react';
import {createUser} from "@/app/_components/UserService.component";

type CreateUserPanelProps = {
    SuccessAction: (userId: number) => void;
    CancelAction: () => void;
};

export default function CreateUserPanel({ SuccessAction, CancelAction }: CreateUserPanelProps) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'Product-Manager' | 'Developer'>('Developer');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const newUser = await createUser({ name: username, email, role });
            SuccessAction(newUser.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunne ikke oprette bruger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-black p-4 rounded border border-white">
            <h2 className="text-center text-white mb-4">Opret en bruger</h2>

            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            <div className="text-white items-align-center flex flex-col">
                Brugernavn
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="m-2 p-2 rounded border border-white text-white"
                    disabled={loading}
                    required
                />
                <br/>
                Email
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="m-2 p-2 rounded border border-white text-white"
                    disabled={loading}
                    required
                />
                Role
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'Product-Manager' | 'Developer')}
                    className="m-2 p-2 rounded border border-white text-white bg-black"
                    disabled={loading}
                    required
                >
                    <option value="Developer">Developer</option>
                    <option value="Product-Manager">Product-Manager</option>
                </select>

            </div>

            <div className="flex justify-center mt-4 gap-2">
                <button
                    type="button"
                    onClick={CancelAction}
                    className="px-4 py-2 bg-gray-500 text-white rounded cursor-pointer"
                    disabled={loading}
                >
                    Annuller
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black rounded cursor-pointer"
                    disabled={loading}
                >
                    {loading ? 'Opretter...' : 'Opret'}
                </button>
            </div>
        </form>
    );
}