import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkTags() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is not defined');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Define inline checking schema to avoid import issues
        const PostSchema = new mongoose.Schema({
            title: String,
            slug: String,
            tags: [String],
            categories: [String],
            status: String
        });

        // Use existing model if already registered (unlikely in script) or create new
        const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

        const specificTitles = [
            'Top 10 Anime for Beginners',
            'Understanding Anime Genres',
            'Fate Series Watch Order',
            'Monogatari Series Order'
        ];

        // Check for specific posts by title or relevant tags
        const posts = await Post.find({
            tags: { $regex: /watch[- ]order/i }
        }).select('title tags categories slug status').lean();

        console.log('Found posts:', JSON.stringify(posts, null, 2));

        const allTags = await Post.distinct('tags');
        const allCategories = await Post.distinct('categories');

        console.log('All Tags:', allTags);
        console.log('All Categories:', allCategories);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkTags();
