import mongoose from 'mongoose';
import { Report } from '../models/report.js';
export class ContextService {
    static async getReportContext(reportId) {
        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return null;
        }
        const report = await Report.findById(reportId).lean();
        if (!report)
            return null;
        const statusText = {
            pending: 'Awaiting verification',
            verified: 'Confirmed by community',
            in_progress: 'Being worked on',
            resolved: 'Fixed and closed',
            rejected: 'Dismissed',
        };
        return `
Report Details:
- Category: ${report.category}
- Status: ${statusText[report.status] || report.status}
- Location: ${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}
- Description: ${report.description || 'No description provided'}
- Submitted: ${new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
- Upvotes: ${report.upvoteCount}
`.trim();
    }
    static async getRelatedReports(reportId, limit = 3) {
        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return [];
        }
        const report = await Report.findById(reportId).lean();
        if (!report)
            return [];
        const related = await Report.find({
            category: report.category,
            _id: { $ne: new mongoose.Types.ObjectId(reportId) },
            status: report.status,
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('category description status createdAt')
            .lean();
        return related.map((r) => `- [${r.status}] ${r.category}: ${r.description || 'No description'} (${new Date(r.createdAt).toLocaleDateString('en-IN')})`);
    }
}
