import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    author: mongoose.Types.ObjectId;
    status: 'draft' | 'published' | 'archived';
    tags: string[];
    categories: string[];
    isDeleted: boolean;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema<IPost> = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            index: true,
            lowercase: true,
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
        },
        excerpt: {
            type: String,
            maxlength: [200, 'Excerpt cannot be more than 200 characters'],
        },
        coverImage: {
            type: String,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
            index: true,
        },
        tags: [{ type: String, index: true }],
        categories: [{ type: String, index: true }],
        isDeleted: {
            type: Boolean,
            default: false,
        },
        publishedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index just in case (optional based on query patterns)
PostSchema.index({ author: 1, slug: 1 });

const Post: Model<IPost> =
    mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
