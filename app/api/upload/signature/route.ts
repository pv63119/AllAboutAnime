import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getSession } from '@/lib/auth/session';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const timestamp = Math.round((new Date).getTime() / 1000);

        // Generate signature
        // Note: Using 'signed_upload_demo_preset' is standard for examples, but 
        // usually you'd set a specific upload preset in Cloudinary dashboard settings.
        // For direct upload with no preset, we just sign the timestamp and potentially other params.

        const validParams = {
            timestamp,
        };

        const signature = cloudinary.utils.api_sign_request(validParams, process.env.CLOUDINARY_API_SECRET!);

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        });
    } catch (error) {
        console.error('Signature Generation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
