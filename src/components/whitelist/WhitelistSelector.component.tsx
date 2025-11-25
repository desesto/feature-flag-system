// components/editFeatureFlag/WhitelistSelector.tsx
"use client";

import { useState, useEffect } from "react";

type WhiteList = {
    id: number;
    name: string;
};

type WhitelistSelectorProps = {
    currentWhitelistId: number | null;
    onWhitelistChange: (whitelistId: number | null) => void;
};

export default function WhitelistSelector({currentWhitelistId, onWhitelistChange,}: WhitelistSelectorProps) {
    const [whitelists, setWhitelists] = useState<WhiteList[]>([]);

    useEffect(() => {
        const fetchWhitelists = async () => {
            try {
                const response = await fetch('/api/whiteLists');
                const data = await response.json();
                setWhitelists(data);
            } catch (error) {
                console.error('Error fetching whitelists:', error);
            }
        };
        fetchWhitelists();
    }, []);

    return (
        <div className="flex flex-col gap-1 mb-3">
            <label className="flex flex-col gap-1">
                Whitelist:
                <select
                    value={currentWhitelistId ?? ''}
                    onChange={(event) => {
                        const whitelistId = Number(event.target.value) || null;
                        onWhitelistChange(whitelistId);
                    }}
                    className="p-2 rounded border"
                >
                    <option value="">Vælg whitelist</option>
                    {whitelists.map((whitelist) => (
                        <option key={whitelist.id} value={whitelist.id}>
                            {whitelist.name}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
}