/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client';

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {GetUsersDto} from "@/lib/dto/user.dto";
import {hasAccessToLogin} from "@/access-control/featureFlagAccess";



export default function Login() {

    const [users, setUsers] = useState<GetUsersDto>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/users");

                if (!response.ok) {
                    throw new Error("Kunne ikke hente brugere");
                }

                const data : GetUsersDto = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);


    const handleLogin = () => {
        if (selectedUserId) {
            const selectedUser = users.find(user => user.id === Number(selectedUserId));

            if (!selectedUser) {
                alert("Bruger ikke fundet");
                return;
            }

            if (!hasAccessToLogin(selectedUser.role)) {
                alert(`${selectedUser.role} har ikke adgang til systemet. Kun Developer og Product-Manager kan logge ind.`);
                return;
            }

            router.push(`/${selectedUserId}`);
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
                    type="button"
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
