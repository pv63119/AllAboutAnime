import { z } from 'zod';

export const createCommentSchema = z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(500),
    postId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Post ID'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
