import { z } from 'zod';

export const createPostSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case').optional(),
    // Optional on create, can be generated from title
    content: z.string().min(10, 'Content must be at least 10 characters'),
    excerpt: z.string().max(200).optional(),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    coverImage: z.string().url().optional().or(z.literal('')),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
