'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import PostPreview from '@/components/PostPreview';
import { useAuth } from '@/app/context/AuthContext';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/editor/Editor'), { ssr: false });

interface PostData {
    _id?: string;
    title: string;
    slug?: string;
    content: string;
    coverImage?: string;
    tags?: string[];
    status: 'draft' | 'published' | 'archived';
}

interface PostEditorProps {
    initialData?: PostData;
    isEditing?: boolean;
}

export default function PostEditor({ initialData, isEditing = false }: PostEditorProps) {
    const router = useRouter();
    const { user } = useAuth();

    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
    const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
    const [status, setStatus] = useState<string>(initialData?.status || 'draft');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        // Generate dynamic excerpt
        let plainTextExcerpt = '';
        try {
            const data = JSON.parse(content);
            if (data.blocks) {
                const paragraph = data.blocks.find((b: any) => b.type === 'paragraph');
                if (paragraph) {
                    // Strip basic HTML if present in text
                    plainTextExcerpt = paragraph.data.text.replace(/<[^>]+>/g, '');
                }
            }
        } catch (e) {
            plainTextExcerpt = content;
        }

        const excerpt = plainTextExcerpt.substring(0, 150) + (plainTextExcerpt.length > 150 ? '...' : '');

        const payload = {
            title,
            content,
            excerpt,
            coverImage,
            tags: tagsArray,
            status
        };

        try {
            const url = isEditing && initialData?._id
                ? `/api/posts/${initialData._id}`
                : '/api/posts';

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push('/author/posts');
                router.refresh();
            } else {
                const data = await res.json();
                if (data.details) {
                    const messages = data.details.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
                    alert(`Validation failed:\n${messages}`);
                } else {
                    alert(data.error || 'Failed to save post');
                }
            }
        } catch (error) {
            console.error('Submit Error:', error);
            alert('An error occurred while saving.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-gray-50">
            {/* Editor Panel (Left) */}
            <div className="w-full md:w-1/2 flex flex-col h-full border-r border-gray-200 bg-white">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white z-10">
                    <h2 className="text-lg font-semibold text-gray-900">{isEditing ? 'Edit Post' : 'Create New Post'}</h2>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => router.back()}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            isLoading={submitting}
                        >
                            {isEditing ? 'Update' : 'Publish'}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <Input
                        name="title"
                        label="Post Title"
                        placeholder="Enter an engaging title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="text-lg font-bold"
                    />

                    <ImageUpload
                        value={coverImage}
                        onChange={setCoverImage}
                        label="Cover Image"
                    />

                    <div className="flex gap-4">
                        <div className="w-2/3">
                            <Input
                                name="tags"
                                label="Tags (comma separated)"
                                placeholder="anime, review, news..."
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>
                        <div className="w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div className="min-h-[500px] border border-gray-300 rounded-lg p-4 bg-white">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                        <Editor
                            initialContent={content}
                            onChange={setContent}
                        />
                    </div>
                </div>
            </div>

            {/* Preview Panel (Right) */}
            <div className="hidden md:flex w-1/2 flex-col h-full bg-gray-50">
                <div className="p-4 border-b border-gray-200 bg-gray-100 text-center font-medium text-gray-500 uppercase tracking-wide text-xs">
                    Live Preview
                </div>
                <div className="flex-1 overflow-y-auto">
                    {/* Scale down preview slightly to fit better if needed, or just render as is */}
                    <div className="origin-top transform scale-90 sm:scale-100">
                        <PostPreview
                            title={title}
                            content={content || 'Start typing to see your content here...'}
                            coverImage={coverImage}
                            authorName={user?.name || 'You'}
                            createdAt={new Date().toISOString()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
