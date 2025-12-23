'use client';

import { useState, useCallback } from 'react';
import { Button } from './Button';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    compact?: boolean;
}

export default function ImageUpload({ value, onChange, label = "Upload Image", compact = false }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setProgress(0);

            // 1. Get Signature from Backend
            const signRes = await fetch('/api/upload/signature', { method: 'POST' });
            if (!signRes.ok) throw new Error('Failed to get upload signature');

            const { signature, timestamp, cloudName, apiKey } = await signRes.json();

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    onChange(data.secure_url);
                    setUploading(false);
                } else {
                    console.error('Upload failed:', xhr.responseText);
                    alert('Upload failed');
                    setUploading(false);
                }
            };

            xhr.onerror = () => {
                console.error('Upload error');
                alert('Upload failed');
                setUploading(false);
            };

            xhr.send(formData);

        } catch (error) {
            console.error('Upload Error:', error);
            alert('Something went wrong during upload');
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            <div className={`border-2 border-dashed border-gray-300 rounded-lg text-center hover:bg-gray-50 transition-colors ${compact ? 'p-3' : 'p-6'}`}>
                {value ? (
                    <div className={`relative overflow-hidden rounded-lg ${compact ? 'h-20 w-36 mx-auto shadow-sm ring-1 ring-gray-200' : 'aspect-video w-full mb-4'}`}>
                        <img src={value} alt="Uploaded" className="object-cover w-full h-full" />
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                            </label>
                            <span className="pl-1">or drag and drop</span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                )}

                {uploading && (
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                )}
            </div>

            {/* Hidden input to ensure value is part of form submission if native handling is used, 
                though our Page component handles state manually */}
            <input type="hidden" name="coverImage" value={value || ''} />
        </div>
    );
}
