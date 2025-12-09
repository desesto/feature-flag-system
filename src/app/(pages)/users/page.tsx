import Tabs from "@/components/tabs/Tabs.component";
import {UserDto} from "@/lib/dto/user.dto";
import CreateUserButton from "@/components/createUser/CreateUserButton.component";
import {getUserRole} from "@/lib/helpers/user";
import {hasAccessToCreateUser} from "@/access-control/featureFlagAccess";

export default async function UsersPage() {
    const response = await fetch("http://localhost:3000/api/users", {
        cache: 'no-store'
    });

    if (!response.ok) {
        return <div className="text-gray-400 p-4">Failed to load users</div>;
    }

    const users: UserDto[] = await response.json();


    return (
        <div className="mt-10 flex flex-col">
            <div className="mx-auto w-full max-w-7xl">
                <Tabs/>
            </div>

            <div className="mt-8 mx-auto">
                <h2 className="font-bold text-pink-400 text-2xl mb-4">Bruger Oversigt</h2>
                <CreateUserButton />
            <div className="border-white border-2 rounded-md mt-4 max-w-3xl">
                <div className="grid grid-cols-[minmax(150px,1.5fr)_180px_minmax(150px,1.5fr)] gap-4 p-3 font-bold border-b-2 border-gray-400 bg-gray-800">
                    <span>Navn</span>
                    <span className="text-left">Rolle</span>
                    <span className="text-left">Email</span>
                </div>

                <ul className="p-2">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <li
                                className="border-b-2 border-gray-500 p-3 grid grid-cols-[minmax(150px,1.5fr)_180px_minmax(150px,1.5fr)] gap-4 items-center even:bg-neutral-800"
                                key={user.id}
                            >
                                <span className="text-gray-300 truncate" >{user.name }</span>
                                <span className="text-gray-300 truncate" >{user.role }</span>
                                <span className="text-gray-300 truncate" >{user.email }</span>
                            </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-gray-400">
                            Ingen brugere fundet
                        </li>
                    )}
                </ul>
            </div>
        </div>
        </div>
    );
}