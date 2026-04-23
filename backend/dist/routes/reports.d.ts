import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const createReport: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getReports: (req: Request, res: Response) => Promise<void>;
export declare const getReportById: (req: Request, res: Response) => Promise<void>;
export declare const getReportStats: (_req: Request, res: Response) => Promise<void>;
