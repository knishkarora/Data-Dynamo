import mongoose from 'mongoose';
export declare const Report: mongoose.Model<{
    userId: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    category: "pothole" | "garbage" | "water" | "electricity" | "road" | "streetlight" | "drainage" | "other";
    status: "pending" | "verified" | "in_progress" | "resolved" | "rejected";
    upvoteCount: number;
    upvotedBy: string[];
    createdAt: NativeDate;
    updatedAt: NativeDate;
    location?: {
        type: "Point";
        coordinates: number[];
    } | null | undefined;
    description?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    userId: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    category: "pothole" | "garbage" | "water" | "electricity" | "road" | "streetlight" | "drainage" | "other";
    status: "pending" | "verified" | "in_progress" | "resolved" | "rejected";
    upvoteCount: number;
    upvotedBy: string[];
    createdAt: NativeDate;
    updatedAt: NativeDate;
    location?: {
        type: "Point";
        coordinates: number[];
    } | null | undefined;
    description?: string | null | undefined;
}, {}, mongoose.DefaultSchemaOptions> & {
    userId: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    category: "pothole" | "garbage" | "water" | "electricity" | "road" | "streetlight" | "drainage" | "other";
    status: "pending" | "verified" | "in_progress" | "resolved" | "rejected";
    upvoteCount: number;
    upvotedBy: string[];
    createdAt: NativeDate;
    updatedAt: NativeDate;
    location?: {
        type: "Point";
        coordinates: number[];
    } | null | undefined;
    description?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    userId: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    category: "pothole" | "garbage" | "water" | "electricity" | "road" | "streetlight" | "drainage" | "other";
    status: "pending" | "verified" | "in_progress" | "resolved" | "rejected";
    upvoteCount: number;
    upvotedBy: string[];
    createdAt: NativeDate;
    updatedAt: NativeDate;
    location?: {
        type: "Point";
        coordinates: number[];
    } | null | undefined;
    description?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    userId: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    category: "pothole" | "garbage" | "water" | "electricity" | "road" | "streetlight" | "drainage" | "other";
    status: "pending" | "verified" | "in_progress" | "resolved" | "rejected";
    upvoteCount: number;
    upvotedBy: string[];
    createdAt: NativeDate;
    updatedAt: NativeDate;
    location?: {
        type: "Point";
        coordinates: number[];
    } | null | undefined;
    description?: string | null | undefined;
}>, {}, mongoose.DefaultSchemaOptions> & mongoose.FlatRecord<{
    userId: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    category: "pothole" | "garbage" | "water" | "electricity" | "road" | "streetlight" | "drainage" | "other";
    status: "pending" | "verified" | "in_progress" | "resolved" | "rejected";
    upvoteCount: number;
    upvotedBy: string[];
    createdAt: NativeDate;
    updatedAt: NativeDate;
    location?: {
        type: "Point";
        coordinates: number[];
    } | null | undefined;
    description?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
