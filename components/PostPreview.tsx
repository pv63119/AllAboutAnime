import UserAvatar from '@/components/UserAvatar';
import Image from 'next/image';
import EditorRenderer from '@/components/editor/EditorRenderer';

interface PostPreviewProps {
    title: string;
    content: string;
    coverImage?: string;
    authorName?: string;
    createdAt?: string;
    className?: string; // Allow custom styling
}

export default function PostPreview({
    title,
    content,
    coverImage,
    authorName = 'Unknown Author',
    createdAt,
    className = ''
}: PostPreviewProps) {
    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString()
        : new Date().toLocaleDateString();

    return (
        <article className={`min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8 ${className}`}>
            <div className="mx-auto max-w-3xl">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">{title || 'Untitled Post'}</h1>
                    <div className="mt-4 flex items-center justify-center gap-2 text-gray-500">
                        <span className="flex items-center gap-2 font-medium text-gray-900">
                            <span className="text-gray-500 font-normal">By</span>
                            <UserAvatar name={authorName} className="h-6 w-6 text-xs" />
                            {authorName}
                        </span>
                        <span>•</span>
                        <time>{formattedDate}</time>
                    </div>
                </div>

                {coverImage && (
                    <div className="mt-8 relative aspect-video">
                        <Image
                            src={coverImage}
                            className="rounded-lg object-cover"
                            alt={title}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 800px"
                        />
                    </div>
                )}

                <div className="mt-12">
                    <EditorRenderer content={content} />
                </div>
            </div>
        </article>
    );
}
