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
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Unified Header */}
            <div className="h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between z-20 shrink-0 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">{isEditing ? 'Edit Post' : 'Create Post'}</h2>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="block rounded-md border-gray-300 border px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div className="h-6 w-px bg-gray-300 mx-2" />

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => router.back()}
                            disabled={submitting}
                            className="!py-1.5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            isLoading={submitting}
                            className="!py-1.5"
                        >
                            {isEditing ? 'Update' : 'Publish'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Split View Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Editor Panel (Left) */}
                <div className="w-full md:w-2/3 flex flex-col h-full border-r border-gray-200 bg-white overflow-y-auto">
                    <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
                        <Input
                            name="title"
                            label="Post Title"
                            placeholder="Enter an engaging title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="text-2xl font-bold p-4"
                        />

                        <div className="flex gap-6">
                            <div className="w-1/2">
                                <ImageUpload
                                    value={coverImage}
                                    onChange={setCoverImage}
                                    label="Cover Image"
                                    compact={true}
                                />
                            </div>
                            <div className="w-1/2 flex flex-col">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                <textarea
                                    name="tags"
                                    placeholder="anime, review, news..."
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    className="block w-full flex-1 rounded-lg border border-gray-300 p-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-shadow"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Content</label>
                            <div className="min-h-[600px] border border-gray-200 rounded-xl p-6 bg-white shadow-sm ring-1 ring-gray-100">
                                <Editor
                                    initialContent={content}
                                    onChange={setContent}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Panel (Right) */}
                <div className="hidden md:flex w-1/3 flex-col h-full bg-gray-50/50 pr-6 overflow-hidden">
                    <div className="py-3 text-center font-medium text-gray-400 uppercase tracking-widest text-[10px]">
                        Live Preview
                    </div>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pb-12 flex flex-col items-center">
                        <div style={{ zoom: '0.45' }} className="w-[210%] bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden mt-8 origin-top shrink-0">
                            {/* Added wrapper styling for preview card look */}
                            <PostPreview
                                title={title}
                                content={content || 'Start typing to see your content here...'}
                                coverImage={coverImage}
                                authorName={user?.name || 'You'}
                                createdAt={new Date().toISOString()}
                                className="!min-h-0 !py-8 !px-24"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
