export default function Loading() {
    return (
        <div className="space-y-6 p-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
            </div>

            <div className="h-64 bg-gray-200 rounded-xl mt-8"></div>
        </div>
    );
}
