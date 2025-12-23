'use client';

import { useEffect, useRef, useCallback } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import ImageTool from '@editorjs/image';

interface EditorProps {
    onChange: (data: string) => void;
    initialContent?: string;
    placeholder?: string;
}

export default function Editor({ onChange, initialContent, placeholder }: EditorProps) {
    const ref = useRef<EditorJS | null>(null);
    const holderId = 'editorjs-container';

    // Helper to separate initialization logic
    const initializeEditor = useCallback(async () => {
        if (ref.current) return;

        let parsedData: any = { time: Date.now(), blocks: [] };
        try {
            parsedData = initialContent ? JSON.parse(initialContent) : { time: Date.now(), blocks: [] };
        } catch (e) {
            // Fallback for legacy plain text: put it in a single paragraph
            if (initialContent) {
                parsedData = {
                    time: Date.now(),
                    blocks: [
                        {
                            type: 'paragraph',
                            data: {
                                text: initialContent,
                            },
                        },
                    ],
                };
            }
        }

        const editor = new EditorJS({
            holder: holderId,
            placeholder: placeholder || 'Start writing your story...',
            inlineToolbar: true,
            data: parsedData,
            tools: {
                header: {
                    class: Header,
                    config: {
                        levels: [2, 3, 4],
                        defaultLevel: 2,
                    },
                },
                list: List,
                paragraph: {
                    class: Paragraph,
                    inlineToolbar: true,
                },
                quote: Quote,
                code: Code,
                inlineCode: InlineCode,
                image: {
                    class: ImageTool,
                    config: {
                        uploader: {
                            async uploadByFile(file: File) {
                                try {
                                    // Use our existing Cloudinary upload flow
                                    // We need to implement a small helper here to reuse the logic
                                    const formData = new FormData();
                                    formData.append('file', file);

                                    // First get signature
                                    const sigRes = await fetch('/api/upload/signature', { method: 'POST' });
                                    const { signature, timestamp, cloudName, apiKey } = await sigRes.json();

                                    formData.append('signature', signature);
                                    formData.append('timestamp', timestamp);
                                    formData.append('api_key', apiKey);

                                    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                        method: 'POST',
                                        body: formData
                                    });
                                    const data = await uploadRes.json();

                                    return {
                                        success: 1,
                                        file: {
                                            url: data.secure_url,
                                        },
                                    };
                                } catch (error) {
                                    console.error('Image upload failed', error);
                                    return {
                                        success: 0,
                                        file: { url: '' }
                                    };
                                }
                            }
                        }
                    }
                }
            },
            onChange: async () => {
                const data = await editor.save();
                onChange(JSON.stringify(data));
            },
        });

        ref.current = editor;
    }, [initialContent, onChange, placeholder]);

    useEffect(() => {
        // Initialize editor only once on mount
        initializeEditor();

        return () => {
            if (ref.current && ref.current.destroy) {
                ref.current.destroy();
                ref.current = null;
            }
        };
    }, []); // Empty dependency array to init once. We don't want re-init on content change as Editor handles internal state.

    return <div id={holderId} className="prose prose-lg max-w-none min-h-[500px]" />;
}
