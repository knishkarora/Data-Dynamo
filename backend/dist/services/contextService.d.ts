export declare class ContextService {
    static getReportContext(reportId: string): Promise<string | null>;
    static getRelatedReports(reportId: string, limit?: number): Promise<string[]>;
}
