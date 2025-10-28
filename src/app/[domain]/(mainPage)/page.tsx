export default async function Page({params}: {params: {id: string}}) {
    const userId = params.id;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}`, {
        cache: "no-store",
    });
    const user = await response.json();

    return (
        <div className="flex items-center justify-center">
            <span className="text-center gap-4">
                <h1> Velkommen {user.name} </h1>
            </span>
        </div>
    )
}