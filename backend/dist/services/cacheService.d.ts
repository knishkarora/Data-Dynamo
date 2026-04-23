export declare class CacheService {
    private static getKey;
    static get(message: string, reportId?: string): Promise<string | null>;
    static set(message: string, reportId: string | undefined, response: string): Promise<void>;
    static invalidate(message: string, reportId?: string): Promise<void>;
}
