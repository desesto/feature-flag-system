import CreateUserButton from "@/app/_components/CreateUserButton.component";
import Login from "@/app/_components/Login.component";

export default function Page() {
    return (
        <div className="flex items-center justify-center">
            <span className="text-center gap-4">
                <h1> Jens & Clemens ff</h1>
                <Login/>
                <CreateUserButton />
            </span>
        </div>
    )
}