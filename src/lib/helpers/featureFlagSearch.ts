import type {FeatureFlagDto} from "@/lib/dto/featureFlag.dto";


export function binarySearchFeatureFlag(flags: FeatureFlagDto[], search: string): FeatureFlagDto[] {
    const sorted = flags.toSorted((a, b) => a.name.localeCompare(b.name));
    const results: FeatureFlagDto[] = [];

    let left = 0;
    let right = sorted.length - 1;
    let firstMatch = -1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midName = sorted[mid].name;

        if (midName.startsWith(search)) {
            firstMatch = mid;
            right = mid - 1; // Find første match
        } else if (midName < search) {
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
        if (!sorted[index].name.startsWith(search)) {
            break;
        }
        results.push(sorted[index]);
    }

    return results;
}