"use client";

import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const FILTER_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "canary", label: "Canary" },
    { value: "no_strategy", label: "No Strategy" },
];

export default function FilterFeatureFlags() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const existingFilters = searchParams.get("filter")?.split(",") ?? [];

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>(existingFilters);

    const toggleFilter = (value: string) => {
        setSelected(prev =>
            prev.includes(value)
                ? prev.filter(f => f !== value)
                : [...prev, value]
        );
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams);

        if (selected.length === 0) {
            params.delete("filter");
        } else {
            params.set("filter", selected.join(","));
        }

        router.replace(`?${params.toString()}`);
        setOpen(false);
    };

    return (
        <div className="relative inline-block">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600 text-white"
            >
                <Filter className="w-5 h-5" />
                Filter
            </button>

            {open && (
                <div className="absolute mt-2 w-48 bg-gray-900 border border-gray-600 rounded shadow-lg p-4 z-50">
                    <div className="flex flex-col gap-2 text-white">
                        {FILTER_OPTIONS.map(opt => (
                            <label
                                key={opt.value}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(opt.value)}
                                    onChange={() => toggleFilter(opt.value)}
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={applyFilters}
                        className="mt-4 w-full bg-pink-500 hover:bg-pink-600 text-white py-1.5 rounded"
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
    );
}
