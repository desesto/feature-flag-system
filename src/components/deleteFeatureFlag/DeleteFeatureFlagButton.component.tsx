/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client';

import {useRouter} from "next/navigation";

export default function DeleteFeatureFlagButton({ id }: { id: number }) {

    const router = useRouter();

    async function handleDelete(): Promise<void> {

       if (!confirm("Are you sure you want to delete this feature flag?")) {
           return;
       }

       try {
           const response = await fetch(`/api/featureFlags`, {
               method: "DELETE",
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({ id })
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
                className="text-red-400 bg-black hover:underline outline px-1">
            Delete
        </button>
    );
}