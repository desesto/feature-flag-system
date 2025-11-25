import Link from "next/link";
import type { GetWhiteListsDto, WhiteListDto } from "@/lib/dto/whiteList.dto";

export default async function WhiteListsPage() {
    const response = await fetch("http://localhost:3000/api/white-lists", {
        cache: 'no-store'
    });

    if (!response.ok) {
        return <div className="text-gray-400 p-4">Failed to load white lists</div>;
    }

    const whiteLists: GetWhiteListsDto = await response.json();

    if (whiteLists.length === 0) {
        return <div className="text-gray-400 p-4">Ingen white lists endnu</div>;
    }

    return (
        <div className="grid grid-cols-[300px_1fr] gap-4 h-full">
            <div className="border-r border-gray-700">
                <ul className="overflow-y-auto">
                    {whiteLists.map((whiteList: WhiteListDto) => (
                        <li key={whiteList.id}>
                            <Link
                                href={`/white-lists/${whiteList.id}`}
                                className="block w-full text-left p-4 hover:bg-neutral-800 transition-colors text-white"
                            >
                                {whiteList.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex items-center justify-center h-full text-gray-400">
                Vælg en white list for at se brugere
            </div>
        </div>
    );
}