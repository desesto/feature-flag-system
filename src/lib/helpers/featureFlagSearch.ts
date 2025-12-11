import type {FeatureFlagDto} from "@/lib/dto/featureFlag.dto";

export function binarySearchFeatureFlag(flags: FeatureFlagDto[], searchQuery: string): FeatureFlagDto[] {
    const sorted = flags.toSorted((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    const results: FeatureFlagDto[] = [];
    const searchLower = searchQuery.toLowerCase();

    let left = 0;
    let right = sorted.length - 1;
    let firstMatch = -1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midNameLower = sorted[mid].name.toLowerCase();

        if (midNameLower.startsWith(searchLower)) {
            firstMatch = mid;
            right = mid - 1;
        } else if (midNameLower < searchLower) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    if (firstMatch === -1) {
        return [];
    }

    for (let i = 0; i < 7; i++) {
        const index = firstMatch + i;

        if (index >= sorted.length) {
            break;
        }
        if (!sorted[index].name.toLowerCase().startsWith(searchLower)) {
            break;
        }
        results.push(sorted[index]);
    }

    return results;
}