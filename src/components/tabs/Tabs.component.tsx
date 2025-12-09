// components/tabs/Tabs.component.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TabsProps = {
    userId?: number;
};

export default function Tabs({ userId }: TabsProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [storedUserId, setStoredUserId] = useState<number | undefined>(userId);

    useEffect(() => {
        if (userId !== undefined) {

            localStorage.setItem("lastUserId", String(userId));
            setStoredUserId(userId);
        } else {
            const stored = localStorage.getItem("lastUserId");
            if (stored) {
                setStoredUserId(Number(stored));
            }
        }
    }, [userId]);

    const isFeatureFlagsActive = storedUserId !== undefined && pathname === `/${storedUserId}`;
    const isWhitelistsActive = pathname.startsWith("/white-lists");
    const isUsersActive = pathname.startsWith("/users");

    const handleFeatureFlagsClick = (e: React.MouseEvent) => {
        if (storedUserId !== undefined) {
            e.preventDefault();
            router.push(`/${storedUserId}`);
        }
    };

    return (
        <nav className="border-b border-gray-700 mb-1">
            <div className="flex">
                {storedUserId !== undefined ? (
                    <Link
                        href={`/${storedUserId}`}
                        onClick={handleFeatureFlagsClick}
                        className={`
                            px-8 py-4 font-semibold transition-colors border-b-[3px] -mb-[1px]
                            ${isFeatureFlagsActive
                            ? "border-pink-400 text-white"
                            : "border-transparent text-gray-400 hover:text-gray-200"
                        }
                        `}
                    >
                        Feature Flags
                    </Link>
                ) : (
                    <span className="px-8 py-4 font-semibold border-b-[3px] -mb-[1px] border-transparent text-gray-600 cursor-not-allowed">
                        Feature Flags
                    </span>
                )}
                <Link
                    href="/white-lists"
                    className={`
                        px-8 py-4 font-semibold transition-colors border-b-[3px] -mb-[1px]
                        ${isWhitelistsActive
                        ? "border-pink-400 text-white"
                        : "border-transparent text-gray-400 hover:text-gray-200"
                    }
                    `}
                >
                    Whitelists
                </Link>
                <Link
                    href="/users"
                    className={`
                        px-8 py-4 font-semibold transition-colors border-b-[3px] -mb-[1px]
                        ${isUsersActive
                        ? "border-pink-400 text-white"
                        : "border-transparent text-gray-400 hover:text-gray-200"
                    }
                    `}
                >
                    Users
                </Link>
            </div>
        </nav>
    );
}