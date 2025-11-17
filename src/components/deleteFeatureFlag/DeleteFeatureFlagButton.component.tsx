'use client';

import {useRouter} from "next/navigation";

type DeleteFeatureFlagButtonProps = {
    id: number;
    userId: number;
    userRole: string | null;
}

export default function DeleteFeatureFlagButton({ id, userId, userRole }: DeleteFeatureFlagButtonProps) {

    const router = useRouter();

    async function handleDelete(): Promise<void> {

       if (!confirm("Are you sure you want to delete this feature flag?")) {
           return;
       }

       try {
           const response = await fetch(`/api/featureFlags/${id}`, {
               method: "DELETE",
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({ id, userId })
           });

           if (!response.ok) {
               throw new Error("Failed to delete feature flag");
           }

           router.refresh();

       } catch (error) {
           console.error("Error deleting feature flag:", error);
       }
    }


    return (
        <button
                type="button"
                onClick={handleDelete}
                disabled={userRole !== 'Developer'}
                className={`px-1 ${
                    userRole === 'Developer'
                        ? "text-red-400 bg-black hover:underline outline"
                        : "text-gray-400 cursor-not-allowed opacity-50"
                }`}>
            Delete
        </button>
    );
}