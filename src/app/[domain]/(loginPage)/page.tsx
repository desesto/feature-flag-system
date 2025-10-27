import Login from "@/app/[domain]/(loginPage)/_components/Login.component";
import CreateUser from "@/app/[domain]/(loginPage)/_components/CreateUser.component";

export default async function Page() {
    return (
        <div className="flex items-center justify-center">
            <span className="text-center gap-4">
                <h1> Jens & Clemens ff</h1>
                <Login/>
                <CreateUser />
            </span>
        </div>
    )
}