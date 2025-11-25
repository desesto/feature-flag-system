'use client';

import {useRouter} from "next/navigation";

type DeleteWhiteListUserButtonProps = {
    whiteListId: number;
    userId: number;
}

export default function DeleteWhiteListUserButton({ whiteListId, userId }: DeleteWhiteListUserButtonProps) {

    const router = useRouter();

    async function handleDelete(): Promise<void> {

        if (!confirm("Are you sure you want to delete this user from the white list?")) {
            return;
        }

        try {
            const response = await fetch(`/api/white-lists/${whiteListId}`, {
                method: "DELETE",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ whiteListId, userId })
            });

            if (!response.ok) {
                throw new Error("Failed to delete user from white list");
            }

            router.refresh();

        } catch (error) {
            console.error("Error deleting user from white list:", error);
        }
    }


    return (
        <button
            type="button"
            onClick={handleDelete}
            className={"px-1 text-red-400 bg-black hover:underline outline"}>
            Delete
        </button>
    );
}