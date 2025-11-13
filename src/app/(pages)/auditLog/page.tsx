import AuditLog from "@/components/auditLog/AuditLog.component";


export default function Page() {
    return (
        <div className="flex items-center justify-center">
            <span className="text-center gap-4 mt-20">
                <h1 className="font-bold text-green-400 text-4xl"> Audit log</h1>
                <AuditLog/>
            </span>
        </div>
    )
}