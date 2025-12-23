import React from 'react';

interface UserAvatarProps {
    name?: string;
    className?: string;
}

export default function UserAvatar({ name, className = '' }: UserAvatarProps) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div
            className={`inline-flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full select-none ${className}`}
            aria-label={name || 'User'}
        >
            {initial}
        </div>
    );
}
