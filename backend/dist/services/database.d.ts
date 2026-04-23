declare class Database {
    private connected;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
}
export declare const db: Database;
export {};
