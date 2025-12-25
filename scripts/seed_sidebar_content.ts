
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedSidebarContent() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is not defined');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Inline Schema
        const PostSchema = new mongoose.Schema({
            title: String,
            slug: String,
            content: String,
            excerpt: String,
            author: mongoose.Types.ObjectId,
            status: { type: String, default: 'published' },
            tags: [String],
            categories: [String],
            isDeleted: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
            publishedAt: { type: Date, default: Date.now }
        });

        const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ name: String, email: String }));

        // Get an admin user to assign as author
        const adminUser = await User.findOne();
        if (!adminUser) {
            console.error('No user found to assign as author');
            return;
        }

        const sidebarPosts = [
            // Start Watching (Beginner Guides)
            {
                title: 'Top 10 Anime for Beginners',
                slug: 'top-10-anime-for-beginners',
                tags: ['beginner-guide', 'recommendations'],
                categories: ['Guides'],
                content: '{"blocks":[{"type":"paragraph","data":{"text":"Content for Top 10 Anime for Beginners..."}}]}'
            },
            {
                title: 'Understanding Anime Genres',
                slug: 'understanding-anime-genres',
                tags: ['beginner-guide', 'education'],
                categories: ['Guides'],
                content: '{"blocks":[{"type":"paragraph","data":{"text":"Content for Understanding Anime Genres..."}}]}'
            },
            {
                title: 'How to Watch Anime Legal',
                slug: 'how-to-watch-anime-legal',
                tags: ['beginner-guide', 'legal'],
                categories: ['Guides'],
                content: '{"blocks":[{"type":"paragraph","data":{"text":"Content for How to Watch Anime Legal..."}}]}'
            },

            // Watch Orders
            {
                title: 'Fate Series Watch Order',
                slug: 'fate-series-watch-order',
                tags: ['watch-order', 'fate'],
                categories: ['Guides'],
                content: '{"blocks":[{"type":"paragraph","data":{"text":"Content for Fate Series Watch Order..."}}]}'
            },
            {
                title: 'Monogatari Series Order',
                slug: 'monogatari-series-order',
                tags: ['watch-order', 'monogatari'],
                categories: ['Guides'],
                content: '{"blocks":[{"type":"paragraph","data":{"text":"Content for Monogatari Series Order..."}}]}'
            },
            {
                title: 'Gundam Universe Guide',
                slug: 'gundam-universe-guide',
                tags: ['watch-order', 'gundam'],
                categories: ['Guides'],
                content: '{"blocks":[{"type":"paragraph","data":{"text":"Content for Gundam Universe Guide..."}}]}'
            }
        ];

        for (const postData of sidebarPosts) {
            await Post.findOneAndUpdate(
                { slug: postData.slug },
                {
                    ...postData,
                    author: adminUser._id,
                    excerpt: `This is a placeholder excerpt for ${postData.title}.`,
                    status: 'published',
                    isDeleted: false
                },
                { upsert: true, new: true }
            );
            console.log(`Seeded: ${postData.title}`);
        }

        console.log('Sidebar content seeded successfully.');

    } catch (error) {
        console.error('Error seeding sidebar content:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedSidebarContent();
