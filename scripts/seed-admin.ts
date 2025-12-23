import dbConnect from '../lib/db/connect';
import User from '../models/User';
import argon2 from 'argon2';

async function verify() {
    console.log('🔄 Connecting to Database...');
    try {
        await dbConnect();
        console.log('✅ Database Connected Successfully!');

        console.log('🔄 Checking for Admin User...');
        const adminEmail = 'admin@example.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('ℹ️ Admin user already exists.');
        } else {
            console.log('🔄 Creating Admin User...');
            const passwordHash = await argon2.hash('admin123');
            await User.create({
                email: adminEmail,
                passwordHash,
                name: 'Super Admin',
                role: 'admin',
                isVerified: true,
            });
            console.log('✅ Admin User Created Successfully via Mongoose!');
        }
    } catch (error) {
        console.error('❌ Database Connection Failed:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

verify();
