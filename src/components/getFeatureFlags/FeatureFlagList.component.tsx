/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
"use client"

import {useState, useMemo, useRef, useEffect} from 'react';
import {binarySearchFeatureFlag} from "@/lib/helpers/featureFlagSearch";
import type {GetFeatureFlagsDto} from "@/lib/dto/featureFlag.dto";
import DeleteFeatureFlagButtonComponent from "@/components/deleteFeatureFlag/DeleteFeatureFlagButton.component";
import EditFeatureFlag from "@/components/editFeatureFlag/EditFeatureFlag.component";
import FeatureFlagToggle from "@/components/updateFeatureFlag/FeatureFlagToggle.component";
import FeatureFlagDescription from "@/components/featureFlagDescription/FeatureFlagDescription.component";
import FilterFeatureFlags from "@/components/filterFeatureFlags/FilterFeatureFlags.component";
import {useSearchParams} from "next/navigation";

type FeatureFlagListProps = {
    userId: number;
    featureFlags: GetFeatureFlagsDto;
    userRole: string;
};

export default function FeatureFlagList({featureFlags, userId, userRole}: FeatureFlagListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const searchParams = useSearchParams();

    const rawFilter = searchParams.get("filter") ?? "";
    const filters = rawFilter.split(",").filter(Boolean);

    const filteredFlags = useMemo(() => {
        if (filters.length === 0) return featureFlags;

        return featureFlags.filter(flag => {
            return filters.some(f => {
                if (f === "active") return flag.is_active === true;
                if (f === "inactive") return flag.is_active === false;
                if (f === "canary") return flag.strategy === "CANARY";
                if (f === "no_strategy") return flag.strategy === "NO_STRATEGY";
                return false;
            });
        });
    }, [featureFlags, filters]);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return binarySearchFeatureFlag(filteredFlags, searchQuery);
    }, [filteredFlags, searchQuery]);

    const displayedFlags = useMemo(() => {
        if (searchQuery.trim()) {
            return searchResults;
        }
        return filteredFlags;
    }, [filteredFlags, searchResults, searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
                handleSelectFlag(searchResults[highlightedIndex].id);
            } else if (searchQuery.trim()) {
                setShowDropdown(false);
                inputRef.current?.blur();
            }
            return;
        }

        if (!showDropdown || searchResults.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < searchResults.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > -1 ? prev - 1 : -1);
                break;
            case 'Escape':
                setShowDropdown(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleSelectFlag = (flagId: number) => {
        const selectedFlag = featureFlags.find(f => f.id === flagId);
        if (selectedFlag) {
            setSearchQuery(selectedFlag.name);
        }
        setShowDropdown(false);
        setHighlightedIndex(-1);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setShowDropdown(false);
        setHighlightedIndex(-1);
    };

    useEffect(() => {
        console.log("Sample flag:", featureFlags[0]);
        console.log("Filters:", filters);
    }, [featureFlags, filters]);

    return (
        <div>
            <div className="mb-4 flex gap-3 items-start">
                <FilterFeatureFlags/>

                <div className="flex-1 relative" ref={dropdownRef}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Søg efter feature flag... klik enter for at søge"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowDropdown(true);
                            setHighlightedIndex(-1);
                        }}
                        onFocus={() => searchQuery && setShowDropdown(true)}
                        onKeyDown={handleKeyDown}
                        className="w-full px-4 py-2 pl-10 bg-gray-800 border-2 border-white rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    )}

                    {showDropdown && searchResults.length > 0 && (
                        <div
                            className="absolute z-50 w-full mt-1 bg-gray-800 border-2 border-white rounded-md shadow-lg max-h-96 overflow-y-auto">
                            {searchResults.map((flag, index) => (
                                <button
                                    key={flag.id}
                                    onClick={() => handleSelectFlag(flag.id)}
                                    className={`w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 ${
                                        index === highlightedIndex ? 'bg-gray-700' : ''
                                    }`}
                                >
                                    {flag.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {showDropdown && searchQuery && searchResults.length === 0 && (
                        <div
                            className="absolute z-50 w-full mt-1 bg-gray-800 border-2 border-white rounded-md shadow-lg p-4 text-center text-gray-400">
                            Ingen resultater fundet for "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-2 text-sm text-gray-400 flex items-center gap-2">
                {searchQuery && (
                    <>
                        <span>Der vises {displayedFlags.length} resultat{displayedFlags.length !== 1 ? 'er' : ''} for "{searchQuery}"</span>
                        <button onClick={clearSearch} className="text-blue-500 hover:underline">Ryd søgning</button>
                    </>
                )}
                {!searchQuery && filters.length > 0 && (
                    <span>Der vises {displayedFlags.length} feature flag{displayedFlags.length !== 1 ? 's' : ''} (filtreret)</span>
                )}
            </div>

            <div className="border-white border-2 rounded-md mt-4">
                <div
                    className="grid grid-cols-[minmax(200px,2fr)_200px_80px_100px] gap-4 p-3 font-bold border-b-2 border-gray-400 bg-gray-800">
                    <span>Name</span>
                    <span className="text-left">Strategy</span>
                    <span>Active</span>
                    <span>Actions</span>
                </div>

                <ul className="p-2">
                    {displayedFlags.length > 0 ? (
                        displayedFlags.map((flag) => (
                            <li
                                className="border-b-2 border-gray-500 p-3 grid grid-cols-[minmax(100px,2fr)_220px_80px_100px] gap-2 items-center even:bg-neutral-800"
                                key={flag.id}
                            >
                                <FeatureFlagDescription featureFlagId={flag.id}>
                                    {flag.name}
                                </FeatureFlagDescription>
                                <span className="text-gray-300 text-left">{flag.strategy || '—'}</span>
                                <FeatureFlagToggle featureFlagId={flag.id} isActive={flag.is_active} userId={userId}/>
                                <div className="flex gap-2 pr-1">
                                    <EditFeatureFlag featureFlagId={flag.id} userId={userId} userRole={userRole}/>
                                    <DeleteFeatureFlagButtonComponent id={flag.id} userId={userId} userRole={userRole}/>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-gray-400">
                            {searchQuery ? `Ingen feature flags fundet for "${searchQuery}"` : 'No feature flags found'}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}