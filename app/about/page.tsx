export const metadata = {
    title: 'About Us | AllAboutAnime',
    description: 'Learn more about the team behind AllAboutAnime.',
};

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-8">
                    About Us
                </h1>

                <div className="prose prose-lg prose-blue text-gray-500">
                    <p>
                        Welcome to <strong>AllAboutAnime</strong>, your number one source for all things anime. We're dedicated to providing you the very best of anime news, reviews, and in-depth analysis, with an emphasis on quality writing, community engagement, and passion for the medium.
                    </p>

                    <h2>Our Mission</h2>
                    <p>
                        Founded in 2024, AllAboutAnime has come a long way from its beginnings. When we first started out, our passion for "bringing the otaku community together" drove us to start this blog.
                    </p>
                    <p>
                        We hope you enjoy our posts as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
                    </p>

                    <h2>The Team</h2>
                    <p>
                        We are a group of passionate anime fans who love to watch, discuss, and write about our favorite series. From shonen battles to slice-of-life drama, we cover it all.
                    </p>
                </div>
            </div>
        </div>
    );
}

