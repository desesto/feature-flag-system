import Link from "next/link";
import type { GetWhiteListsDto, GetWhiteListWithUsersDto } from "@/lib/dto/whiteList.dto";
import DeleteWhiteListUserButton from "@/components/deleteWhiteListUserButton/DeleteWhiteListUserButton.component";
import AddWhiteListUserButton from "@/components/addWhiteListUserButton/AddWhiteListUserButton.component";

export default async function WhiteListDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const whiteListId = Number(id);

    const whiteListsResponse = await fetch("http://localhost:3000/api/white-lists", {
        cache: 'no-store'
    });
    const whiteLists: GetWhiteListsDto = await whiteListsResponse.json();

    const usersResponse = await fetch(`http://localhost:3000/api/white-lists/${id}`, {
        cache: 'no-store'
    });

    if (!usersResponse.ok) {
        const errorText = await usersResponse.text();
        console.log('Error response:', errorText);
        return <div className="text-gray-400 p-4">Failed to load users: {usersResponse.status}</div>;
    }

    const whiteListUsers: GetWhiteListWithUsersDto = await usersResponse.json();

    return (
        <div className="grid grid-cols-[300px_1fr] gap-4 h-full">
            <div className="border-r border-gray-700">
                <ul className="overflow-y-auto">
                    {whiteLists.map((whiteList) => (
                        <li key={whiteList.id}>
                            <Link
                                href={`/white-lists/${whiteList.id}`}
                                className={`block w-full text-left p-4 hover:bg-neutral-800 transition-colors text-white ${
                                    whiteListId === whiteList.id ? "bg-neutral-800" : ""
                                }`}
                            >
                                {whiteList.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="ml-4">
                <h1 className="text-2xl font-bold text-white mb-6 mt-6">{whiteListUsers.name}</h1>

                {whiteListUsers.users.length === 0 ? (
                    <div className="text-gray-400 pb-4">Ingen brugere i denne whitelist</div>
                ) : (
                    <>
                        <div className="grid grid-cols-[minmax(200px,2fr)_200px_250px_100px] gap-4 p-3 font-bold border-b-2 border-gray-400 bg-gray-800">
                            <span className="text-gray-300">Name</span>
                            <span className="text-gray-300">Role</span>
                            <span className="text-gray-300">Email</span>
                            <span className="text-gray-300">Actions</span>
                        </div>
                        <ul className="p-2 border-gray-500 border-2 rounded-md">
                            {whiteListUsers.users.map((user) => (
                                <li
                                    key={user.id}
                                    className="border-b-2 border-gray-500 p-3 grid grid-cols-[minmax(200px,2fr)_200px_250px_100px] gap-2 items-center even:bg-neutral-800"
                                >
                                    <span className="text-gray-200">{user.name}</span>
                                    <span className="text-gray-400">{user.role}</span>
                                    <span className="text-gray-400">{user.email}</span>
                                    <div className="flex gap-2 pr-1">
                                        <DeleteWhiteListUserButton whiteListId={whiteListId} userId={user.id} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                <AddWhiteListUserButton whiteListId={whiteListId}/>
            </div>
        </div>
    );
}