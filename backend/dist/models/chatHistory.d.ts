import mongoose from 'mongoose';
export declare const ChatHistory: mongoose.Model<{
    userId: string;
    createdAt: NativeDate;
    message: string;
    response: string;
    reportId?: string | null | undefined;
    confidence?: number | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    userId: string;
    createdAt: NativeDate;
    message: string;
    response: string;
    reportId?: string | null | undefined;
    confidence?: number | null | undefined;
}, {}, mongoose.DefaultSchemaOptions> & {
    userId: string;
    createdAt: NativeDate;
    message: string;
    response: string;
    reportId?: string | null | undefined;
    confidence?: number | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    userId: string;
    createdAt: NativeDate;
    message: string;
    response: string;
    reportId?: string | null | undefined;
    confidence?: number | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    userId: string;
    createdAt: NativeDate;
    message: string;
    response: string;
    reportId?: string | null | undefined;
    confidence?: number | null | undefined;
}>, {}, mongoose.DefaultSchemaOptions> & mongoose.FlatRecord<{
    userId: string;
    createdAt: NativeDate;
    message: string;
    response: string;
    reportId?: string | null | undefined;
    confidence?: number | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
