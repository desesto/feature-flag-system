export default async function Login() {

    return (
        <div className="flex flex-col items-center justify-center gap-4 border-white border-b border-solid">
            <div>Vælg bruger</div>
            <div className="flex gap-2">
        <input className="border border-white bg-white text-black rounded-4xl cursor-pointer"></input>
            <button>Login</button>
            </div>
        </div>
    )
}
