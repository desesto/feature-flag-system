'use client';

import { useState } from 'react';
import {validateUserInput} from "@/components/createUser/validateUserInput.component";

type CreateUserPanelProps = {
    onSuccess: (userId: number) => void;
    onCancel: () => void;
};

export default function CreateUserPanel({ onSuccess, onCancel }: CreateUserPanelProps) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        role: 'Developer' as 'Product-Manager' | 'Developer' | 'Non-Technical-User',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {

        const validationError = validateUserInput(form);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!response.ok) throw new Error('Failed to create User');

            const newUser = await response.json();

            setForm({ name: '', email: '', role: 'Developer' });


            onSuccess(newUser.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunne ikke oprette bruger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg max-w-md w-full relative">
            <button
                onClick={onCancel}
                type="button"
                className="absolute top-3 right-3 text-white hover:text-gray-300 text-xl font-bold"
            >
                ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Opret ny bruger</h2>

            {error && <p className="text-red-400 mb-3">{error}</p>}

            <label className="flex flex-col gap-1 mb-3">
                Brugernavn:
                <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="p-2 rounded border border-white bg-transparent text-white"
                    disabled={loading}
                    required
                />
            </label>

            <label className="flex flex-col gap-1 mb-3">
                Email:
                <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="p-2 rounded border border-white bg-transparent text-white"
                    disabled={loading}
                    required
                />
            </label>

            <label className="flex flex-col gap-1 mb-3">
                Rolle:
                <select
                    value={form.role}
                    onChange={(e) =>
                        setForm({ ...form, role: e.target.value as 'Product-Manager' | 'Developer' | 'Non-Technical-User' })
                    }
                    className="p-2 rounded border border-white bg-black text-white"
                    disabled={loading}
                >
                    <option value="Developer">Developer</option>
                    <option value="Product-Manager">Product-Manager</option>
                    <option value="Non-Technical-User">Non-Technical-User</option>
                </select>
            </label>

            <div className="flex justify-end gap-3 mt-6">
                <button
                    onClick={onCancel}
                    type="button"
                    className="border border-gray-400 text-gray-300 rounded-lg px-4 py-2 hover:bg-gray-800"
                >
                    Annuller
                </button>
                <button
                    onClick={handleSubmit}
                    type="button"
                    disabled={loading}
                    className="border border-white rounded-lg px-4 py-2 hover:bg-white hover:text-black"
                >
                    {loading ? 'Opretter...' : 'Opret'}
                </button>
            </div>
        </div>
    );
}
