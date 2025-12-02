"use client";

import {useRouter} from "next/navigation";

type DeleteWhiteListProps = {
    whiteListId: number;
}

export default function DeleteWhiteList({whiteListId}: DeleteWhiteListProps) {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            await fetch(`/api/white-lists/${whiteListId}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(whiteListId),
            });

            router.push('/white-lists')
        } catch (err) {
            console.error('Error:', err);
        }
    };

    return (
            <button type="button" onClick={() => handleDelete()} className="text-red-600 border-2 font-bold min-w-8 min-h-8 cursor-pointer">-</button>
    );
}