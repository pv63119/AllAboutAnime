import type { MetadataRoute } from 'next'
import dbConnect from '@/lib/db/connect'
import Post from '@/models/Post'

export const revalidate = 3600 // revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Static routes
    const routes = [
        '',
        '/blog',
        '/login',
        '/register',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Dynamic routes (Posts)
    let postRoutes: MetadataRoute.Sitemap = []

    try {
        await dbConnect()
        const posts = await Post.find({
            status: 'published',
            isDeleted: false
        })
            .select('slug updatedAt')
            .sort({ createdAt: -1 })
            .lean()

        postRoutes = posts.map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: new Date(post.updatedAt),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    } catch (error) {
        console.error('Sitemap generation error:', error)
    }

    return [...routes, ...postRoutes]
}
