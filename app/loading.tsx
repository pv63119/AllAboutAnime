export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-gray-200 h-16 w-full animate-pulse flex items-center px-4 sm:px-6 lg:px-8">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>

            {/* Main Content Skeleton */}
            <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-12">

                {/* Hero / Title Section */}
                <div className="space-y-4 text-center max-w-3xl mx-auto">
                    <div className="h-12 bg-gray-200 rounded-lg w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Feed Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-96 flex flex-col">
                                <div className="h-48 bg-gray-200 w-full"></div>
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Area */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-96">
                            <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
