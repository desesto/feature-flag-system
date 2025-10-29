/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client';

import {useEffect, useState} from "react";
import type {User} from "@/app/types/user";
import {useRouter} from "next/navigation";


export default function Login() {

    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data: User[]= await response.json();
                setUsers(data);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };
        fetchUsers();
    }, []);

    const handleLogin = () => {
        if (selectedUserId) {
            router.push(`/mainPage/${selectedUserId}`);
        }
    };


    return (
        <div className="flex flex-col items-center justify-center gap-4 border-white border-b border-solid">
            <div>Vælg en bruger</div>
            <div className="flex gap-2">
                <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="border border-white bg-white text-black cursor-pointer px-4 py-2"
                >
                    <option value="">Vælg en bruger...</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.email}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleLogin}
                    disabled={!selectedUserId}
                    className="px-4 py-2 bg-white text-black rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Login
                </button>
            </div>
        </div>
    );
}
