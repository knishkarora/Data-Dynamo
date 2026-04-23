export declare const config: {
    nodeEnv: string;
    port: number;
    mongodb: {
        uri: string;
        dbName: string;
    };
    redis: {
        url: string;
        restUrl: string;
        restToken: string;
    };
    clerk: {
        secretKey: string;
    };
    mapbox: {
        apiKey: string;
    };
    upload: {
        dir: string;
        maxFileSizeMB: number;
    };
    corsOrigins: string[];
    groq: {
        apiKey: string;
        model: string;
        maxTokens: number;
    };
    aqi: {
        googleApiKey: string;
        defaultLat: number;
        defaultLng: number;
    };
    chat: {
        cacheTTL: number;
        rateLimitMax: number;
        rateLimitWindow: number;
    };
};
