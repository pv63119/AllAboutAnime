import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    email: string;
    username?: string;
    passwordHash: string;
    name: string;
    role: 'reader' | 'author' | 'admin';
    isVerified: boolean;
    refreshTokenVersion: number;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        username: {
            type: String,
            unique: true,
            sparse: true, // Allows null/undefined values to exist without violating uniqueness
            trim: true,
            lowercase: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [20, 'Username cannot exceed 20 characters'],
            match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
        },
        passwordHash: {
            type: String,
            required: [true, 'Please provide a password'],
            select: false, // Do not return password by default
        },
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            maxlength: [50, 'Name cannot be more than 50 characters'],
        },
        role: {
            type: String,
            enum: ['reader', 'author', 'admin'],
            default: 'reader',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        refreshTokenVersion: {
            type: Number,
            default: 0,
        },
        passwordResetToken: {
            type: String,
            default: null,
        },
        passwordResetExpires: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent overwrite on HMR
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
