import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="flex flex-col space-y-4">
                        <Link href="/" className="text-xl font-bold text-gray-900">
                            AllAbout<span className="text-blue-600">Anime</span>
                        </Link>
                        <p className="text-gray-500 text-sm max-w-xs">
                            Your ultimate destination for anime news, reviews, and recommendations. Join the otaku community today.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter / Social (Placeholder) */}
                    <div className="flex flex-col space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                            Stay Updated
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Follow us on social media for the latest anime updates.
                        </p>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-base text-gray-400">
                        &copy; {new Date().getFullYear()} AllAboutAnime. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        {/* Social Icons placeholders */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
