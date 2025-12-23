// Native fetch used
const BASE_URL = 'http://localhost:3000';

export { };


async function testComments() {
    console.log('🚀 Starting Comment API Test...');

    // 1. Login Admin
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
    });
    const adminCookies = loginRes.headers.get('set-cookie');

    if (!loginRes.ok) { console.error('Login failed'); process.exit(1); }

    // 2. Create Post
    const createRes = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Cookie': adminCookies!, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Post For Comments',
            content: 'Discuss below.',
            status: 'published'
        })
    });
    const postData = await createRes.json();
    const postId = postData.post._id;
    console.log(`✅ Post Created: ${postId}`);

    // 3. Add Comment
    console.log('\n3. Adding Comment...');
    const commentRes = await fetch(`${BASE_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Cookie': adminCookies!, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: 'This is a test comment.',
            postId: postId
        })
    });

    if (!commentRes.ok) {
        console.error('❌ Add Comment Failed:', await commentRes.text());
        process.exit(1);
    }
    const commentData = await commentRes.json();
    console.log('✅ Comment Added:', commentData.comment._id);

    // 4. List Comments
    console.log('\n4. Listing Comments...');
    const listRes = await fetch(`${BASE_URL}/api/comments?postId=${postId}`);
    const listData = await listRes.json();

    if (listData.comments.length === 0) {
        console.error('❌ No comments found');
        process.exit(1);
    }

    console.log(`✅ Found ${listData.comments.length} comments.`);
    console.log('✅ Comment API Test Complete.');
}

testComments();
