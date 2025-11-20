import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center p-8 max-w-md">
                <div className="mb-6">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Adgang Nægtet
                    </h1>
                    <p className="text-gray-600">
                        Du har ikke adgang til denne side.
                    </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700 text-sm">
                        Henvend dig til en udvikler
                    </p>
                </div>

                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-pink-400 text-white font-semibold rounded-lg hover:bg-pink-500 transition-colors"
                >
                    Tilbage til Login
                </Link>
            </div>
        </div>
    );
}