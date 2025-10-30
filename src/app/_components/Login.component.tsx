/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client';

import {useEffect, useState} from "react";
import type {User} from "@/app/types/user";
import {useRouter} from "next/navigation";
import {getUsers} from "@/app/_components/UserService.component";


export default function Login() {

    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
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
        <div className="flex flex-col items-center justify-center gap-4 py-10 border-b ">
            <div>Vælg en bruger</div>
            <div className="flex gap-2">
                <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="bg-white text-black cursor-pointer px-4 py-2"
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
                    className="px-4 py-2 text-white border rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gray-800 hover:bg-cyan-500 font-bold text-whitefont-sans"
                >
                    Login
                </button>
            </div>
        </div>
    );
}
