import CreateUserButton from "@/app/_components/CreateUserButton.component";
import Login from "@/app/_components/Login.component";

export default function Page() {
    return (
        <div className="flex items-center justify-center">
            <span className="text-center gap-4 mt-20">
                <h1 className="font-bigbesty text-pink-400 text-4xl"> Jens-Clemens FF</h1>
                <Login/>
                <CreateUserButton />
            </span>
        </div>
    )
}