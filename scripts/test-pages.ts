// Native fetch used
const BASE_URL = 'http://localhost:3000';

export { };


async function testPages() {
    console.log('🚀 Starting Page Render Test...');

    const pages = [
        { path: '/', name: 'Home Page' },
        { path: '/login', name: 'Login Page' },
        { path: '/register', name: 'Register Page' },
    ];

    for (const page of pages) {
        try {
            const res = await fetch(`${BASE_URL}${page.path}`);
            if (res.ok) {
                console.log(`✅ ${page.name} (${page.path}) - Status: ${res.status}`);
            } else {
                console.error(`❌ ${page.name} (${page.path}) - Failed: ${res.status}`);
                process.exit(1);
            }
        } catch (err) {
            console.error(`❌ ${page.name} - Connection Error`);
            process.exit(1);
        }
    }

    console.log('✅ All Pages Rendered Successfully.');
}

testPages();
