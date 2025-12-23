export default function Loading() {
    return (
        <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-8 animate-pulse">
                {/* Title Skeleton */}
                <div className="space-y-4 text-center">
                    <div className="h-10 bg-gray-200 rounded-lg w-3/4 mx-auto"></div>
                    <div className="flex justify-center gap-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>

                {/* Image Skeleton */}
                <div className="aspect-video w-full bg-gray-200 rounded-xl"></div>

                {/* Content Skeleton */}
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        </div>
    );
}
