import {AuditLogDto, GetAuditLogsDto} from "@/lib/dto/auditLog.dto";

export default async function AuditLog() {
    const response = await fetch('http://localhost:3000/api/auditLogs');

    if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
    }

    const auditLogs: AuditLogDto[] = await response.json();

    const formatDate = (isoString?: string | null) => {
        if (!isoString) return "—";
        const date = new Date(isoString);
        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="border-white border-2 rounded-md mt-4">
            <div className="grid grid-cols-[180px_200px_160px_200px_240px] gap-4 p-3 font-bold border-b-2 border-gray-400 bg-gray-800">
                <span>Time</span>
                <span>Action</span>
                <span>Entity</span>
                <span>Entity Name</span>
                <span>User Email</span>
            </div>

            <ul className="p-2">
                {auditLogs.map((log) => (
                    <li key={log.id}               className="border-b border-gray-700 p-3 grid grid-cols-[180px_200px_160px_200px_240px] gap-4 items-center text-gray-200 even:bg-gray-900"
                    >
                        <span>{formatDate(log.created_at)}</span>
                        <span>{log.action}</span>
                        <span>{log.entity}</span>
                        <span>{log.entity_name}</span>
                        <span>{log.user_email}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}