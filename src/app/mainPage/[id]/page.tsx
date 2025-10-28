export default async function Page({params}: {params: {id: string}}) {
    const response = await fetch(`http://localhost:3000/api/users/${params.id}`);

    const user = await response.json();

    return (
        <div className="flex items-center justify-center">
            <span className="text-center gap-4">
                <h1> Velkommen {user.name} </h1>
            </span>
        </div>
    )
}