export declare class GroqService {
    private static callAPI;
    static getCompletion(userMessage: string, context?: {
        reportData?: string;
        relatedReports?: string[];
    }): Promise<{
        answer: string;
        confidence: number;
    }>;
}
