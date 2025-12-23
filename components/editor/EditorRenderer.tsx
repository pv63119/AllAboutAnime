import React from 'react';
import Image from 'next/image';

interface EditorRendererProps {
    content: string;
}

export default function EditorRenderer({ content }: EditorRendererProps) {
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        // Fallback for legacy plain text content: preserve newlines
        return (
            <div
                className="prose prose-lg prose-blue mx-auto text-gray-500"
                dangerouslySetInnerHTML={{ __html: (content || '').replace(/\n/g, '<br />') }}
            />
        );
    }

    if (!data.blocks) {
        return <div className="prose prose-lg prose-blue mx-auto text-gray-500 whitespace-pre-wrap">{content}</div>;
    }

    return (
        <div className="prose prose-lg prose-blue mx-auto text-gray-500">
            {data.blocks.map((block: any, index: number) => (
                <Block key={index} block={block} />
            ))}
        </div>
    );
}

function Block({ block }: { block: any }) {
    switch (block.type) {
        case 'header':
            const Tag = `h${block.data.level}` as React.ElementType;
            return <Tag dangerouslySetInnerHTML={{ __html: block.data.text }} />;

        case 'paragraph':
            return <p dangerouslySetInnerHTML={{ __html: block.data.text }} />;

        case 'list':
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            return (
                <ListTag>
                    {block.data.items.map((item: string, i: number) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                </ListTag>
            );

        case 'image':
            return (
                <figure className="my-8">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                        <Image
                            src={block.data.file.url}
                            alt={block.data.caption || 'Image'}
                            fill
                            className="object-cover"
                        />
                    </div>
                    {block.data.caption && (
                        <figcaption className="text-center text-sm text-gray-500 mt-2">
                            {block.data.caption}
                        </figcaption>
                    )}
                </figure>
            );

        case 'quote':
            return (
                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 italic my-6 bg-gray-50 rounded-r">
                    <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                    {block.data.caption && <cite className="block text-sm mt-2 not-italic text-gray-400">— {block.data.caption}</cite>}
                </blockquote>
            );

        case 'code':
            return (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6">
                    <code>{block.data.code}</code>
                </pre>
            );

        default:
            return null;
    }
}
