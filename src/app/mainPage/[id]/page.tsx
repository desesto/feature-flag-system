import { getUser } from '@/app/mainPage/_components/GetUser';

export default async function Page({params}: {params: {id: string}}) {
    const user = await getUser(params.id);

    return (
        <div className="flex items-center justify-center">
            <span className="text-center gap-4">
                <h1> Velkommen {user.name} </h1>
            </span>
        </div>
    )
}