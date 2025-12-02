'use client';

import { useState, useEffect } from 'react';

type AddWhiteListUserPanelProps = {
    readonly whiteListId: number;
    onSuccess: () => void;
    onCancel: () => void;
};

export default function AddWhiteListUserPanel({ whiteListId, onSuccess, onCancel }: AddWhiteListUserPanelProps) {
    const [allUsers, setAllUsers] = useState<{ id: number; email: string }[]>([]);
    const [whitelistUsers, setWhitelistUsers] = useState<{ id: number; email: string }[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadUsers() {
            try {
                const [allRes, whitelistRes] = await Promise.all([
                    fetch("/api/users"),
                    fetch(`/api/white-list-users/${whiteListId}`)
                ]);

                const all = await allRes.json();
                const whitelist = await whitelistRes.json();

                setAllUsers(all);
                setWhitelistUsers(whitelist);
            } catch (err) {
                console.error(err);
                setError("Failed to load users");
            }
        }

        loadUsers();
    }, [whiteListId]);

    const handleSubmit = async () => {
        if (!selectedUserId) {
            setError("Please select a user");
            return;
        }

        try {
            setError(null);

            const response = await fetch(`/api/white-list-users/${whiteListId}`, {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ userId: selectedUserId })
            });

            if (!response.ok) throw new Error("Failed to add user");

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not add user");
        }
    };

    const availableUsers = allUsers.filter(
        (user) => !whitelistUsers.some((wUser) => wUser.id === user.id)
    );

    return (
        <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg max-w-md w-full relative">
            <button
                type="button"
                onClick={onCancel}
                className="absolute top-3 right-3 text-white hover:text-gray-300 text-xl font-bold"
            >
                ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Add user to whitelist</h2>

            {error && <p className="text-red-400 mb-3">{error}</p>}

            <label className="flex flex-col gap-1 mb-3">
                <select
                    value={selectedUserId ?? ""}
                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                    className="p-2 rounded border border-white bg-black text-white"
                >
                    <option value="">Choose a user</option>
                    {availableUsers.length > 0 ? (
                        availableUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.email}
                            </option>
                        ))
                    ) : (
                        <option disabled>No users available</option>
                    )}
                </select>
            </label>

            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="border border-gray-400 text-gray-300 rounded-lg px-4 py-2 hover:bg-gray-800"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={handleSubmit}
                    className="border border-white rounded-lg px-4 py-2 hover:bg-white hover:text-black"
                >
                     Add
                </button>
            </div>
        </div>
    );
}
