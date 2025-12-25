export const metadata = {
    title: 'Contact Us | AllAboutAnime',
    description: 'Get in touch with the AllAboutAnime team.',
};

export default function ContactPage() {
    return (
        <div className="bg-white min-h-screen">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-8">
                    Contact Us
                </h1>

                <div className="prose prose-lg prose-blue text-gray-500 mb-12">
                    <p>
                        Have a suggestion, a question, or just want to say hi? We'd love to hear from you!
                    </p>
                </div>

                <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Send us a message</h3>
                    {/* Static form for now */}
                    <form className="grid grid-cols-1 gap-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <div className="mt-1">
                                <input type="text" name="name" id="name" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" placeholder="Your Name" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="mt-1">
                                <input type="email" name="email" id="email" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" placeholder="you@example.com" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                            <div className="mt-1">
                                <textarea id="message" name="message" rows={4} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" placeholder="What's on your mind?"></textarea>
                            </div>
                        </div>
                        <div>
                            <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Email</h3>
                        <p className="mt-2 text-base text-gray-500">contact@allaboutanime.in</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Socials</h3>
                        <p className="mt-2 text-base text-gray-500">@AllAboutAnime</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

