export declare class RateLimiter {
    private static getKey;
    static isAllowed(userId: string): Promise<boolean>;
    static increment(userId: string): Promise<void>;
    static getRemaining(userId: string): Promise<number>;
}
