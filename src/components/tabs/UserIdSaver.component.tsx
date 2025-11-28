"use client";

import { useEffect } from "react";

type UserIdSaverProps = {
    userId: number;
};

export default function UserIdSaver({ userId }: UserIdSaverProps) {
    useEffect(() => {
        localStorage.setItem("lastUserId", String(userId));
    }, [userId]);

    return null;
}