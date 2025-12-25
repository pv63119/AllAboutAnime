
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function cleanupPlaceholders() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is not defined');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Inline Schema for deletion
        const PostSchema = new mongoose.Schema({
            slug: String
        });

        const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

        const slugsToDelete = [
            'top-10-anime-for-beginners',
            'understanding-anime-genres',
            'how-to-watch-anime-legal',
            'fate-series-watch-order',
            'monogatari-series-order',
            'gundam-universe-guide'
        ];

        const result = await Post.deleteMany({ slug: { $in: slugsToDelete } });
        console.log(`Deleted ${result.deletedCount} placeholder posts.`);

    } catch (error) {
        console.error('Error cleaning up placeholders:', error);
    } finally {
        await mongoose.disconnect();
    }
}

cleanupPlaceholders();
