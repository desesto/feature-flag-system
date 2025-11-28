'use client';

import {useRouter} from "next/navigation";
import {useState} from "react";
import AddWhiteListUserPanel from "@/components/addWhiteListUserButton/AddWhiteListUserPanel.component";

type AddWhiteListUserButtonProps = {
    whiteListId: number;
}

export default function AddWhiteListUserButton({ whiteListId }: AddWhiteListUserButtonProps) {
    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);

    const handleSuccess = () => {
        setShowPopup(false);
        router.refresh();
    };

    const handleCancel = () => {
        setShowPopup(false);
    };

    return (
        <div className="mt-4">
        <button
            type="button"
            onClick={() => setShowPopup(true)}
            className={"px-1 text-green-400 bg-black hover:underline outline rounded-md"}>
            Add user
        </button>

            {showPopup && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center">
                    <AddWhiteListUserPanel
                        whiteListId={whiteListId}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            )}
        </div>
    );
}