declare class RedisService {
    private _client;
    private restUrl;
    private restToken;
    get client(): {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string, expireSeconds?: number) => Promise<boolean>;
        setex: (key: string, seconds: number, value: string) => Promise<boolean>;
        del: (key: string) => Promise<boolean>;
        exists: (key: string) => Promise<number>;
        incr: (key: string) => Promise<number>;
        expire: (key: string, seconds: number) => Promise<boolean>;
        deletePattern: (pattern: string) => Promise<void>;
    } | undefined;
    connect(): Promise<void>;
    private exec;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, expireSeconds?: number): Promise<boolean>;
    setex(key: string, seconds: number, value: string): Promise<boolean>;
    del(key: string): Promise<boolean>;
    exists(key: string): Promise<number>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<boolean>;
    deletePattern(pattern: string): Promise<void>;
}
export declare const redis: RedisService;
export {};
