// Native fetch used
const BASE_URL = 'http://localhost:3000';

export { };


async function testPosts() {
    console.log('🚀 Starting Post API Test...');

    // 1. Setup Admin
    console.log('\n🔄 Logging in as Admin...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
    });

    if (!loginRes.ok) {
        console.error('❌ Admin Login Failed.');
        process.exit(1);
    }

    const adminCookies = loginRes.headers.get('set-cookie');
    console.log('✅ Admin Logged In');

    // 2. Create Post (Published)
    console.log('\n2. Creating Post (Published)...');
    const createRes = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Cookie': adminCookies!, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'My First Post',
            content: 'This is some awesome content for the blog.',
            status: 'published',
            tags: ['tech', 'nextjs']
        })
    });

    if (!createRes.ok) {
        console.error('❌ Create Post Failed:', await createRes.text());
        process.exit(1);
    }

    const createData = await createRes.json();
    const postId = createData.post._id;
    const postSlug = createData.post.slug;
    console.log(`✅ Post Created: ${postSlug} (${postId})`);

    // 3. List Posts
    console.log('\n3. Listing Posts...');
    const listRes = await fetch(`${BASE_URL}/api/posts?status=published`);
    const listData = await listRes.json();

    if (listData.posts.length === 0) {
        console.error('❌ List returned 0 posts. Expected at least 1.');
        process.exit(1);
    }

    // Verify our post is in the list
    const found = listData.posts.find((p: any) => p._id === postId);
    if (!found) {
        console.error('❌ Created post not found in list.');
        process.exit(1);
    }
    console.log(`✅ Found ${listData.posts.length} posts.`);

    // 4. Update Post
    console.log('\n4. Updating Post...');
    const updateRes = await fetch(`${BASE_URL}/api/posts/${postSlug}`, {
        method: 'PUT',
        headers: { 'Cookie': adminCookies!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' })
    });

    if (!updateRes.ok) {
        console.error('❌ Update Failed');
        process.exit(1);
    }
    console.log('✅ Post Updated');

    // 5. Delete Post
    console.log('\n5. Deleting Post (Soft)...');
    const delRes = await fetch(`${BASE_URL}/api/posts/${postSlug}`, {
        method: 'DELETE',
        headers: { 'Cookie': adminCookies! }
    });

    if (!delRes.ok) {
        console.error('❌ Delete Failed');
        process.exit(1);
    }
    console.log('✅ Post Deleted');

    console.log('✅ Post CRUD Test Complete.');
}

testPosts();
