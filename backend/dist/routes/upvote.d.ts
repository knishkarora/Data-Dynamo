import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const upvote: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const removeUpvote: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const checkUpvoteStatus: (req: AuthenticatedRequest, res: Response) => Promise<void>;
