"use client";

import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const FILTER_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "canary", label: "Canary" },
    { value: "no_strategy", label: "No Strategy" },
];

export default function FilterFeatureFlags() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const existingFilters = searchParams.get("filter")?.split(",").filter(Boolean) ?? [];

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>(existingFilters);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    useEffect(() => {
        const urlFilters = searchParams.get("filter")?.split(",").filter(Boolean) ?? [];
        setSelected(urlFilters);
    }, [searchParams]);

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

        router.push(`?${params.toString()}`);
        setOpen(false);
    };

    const clearFilters = () => {
        setSelected([]);
        const params = new URLSearchParams(searchParams);
        params.delete("filter");
        router.push(`?${params.toString()}`);
        setOpen(false);
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border-2 border-white text-white hover:bg-gray-700 transition-colors h-[42px]"
            >
                <Filter className="w-5 h-5" />
                Filter
                {existingFilters.length > 0 && (
                    <span className="ml-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {existingFilters.length}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute left-0 mt-2 w-56 bg-gray-900 border-2 border-white rounded-md shadow-lg p-4 z-50">
                    <div className="flex flex-col gap-2 text-white mb-3">
                        {FILTER_OPTIONS.map(opt => (
                            <label
                                key={opt.value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 p-1 rounded"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(opt.value)}
                                    onChange={() => toggleFilter(opt.value)}
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <span className="text-sm">{opt.label}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded transition-colors text-sm font-medium"
                        >
                            Apply
                        </button>
                        {selected.length > 0 && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors text-sm font-medium"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}