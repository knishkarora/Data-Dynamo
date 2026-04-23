import { Request, Response, NextFunction } from 'express';
export interface AuthUser {
    userId: string;
    payload: Record<string, unknown>;
}
export interface AuthenticatedRequest extends Request {
    user?: AuthUser;
}
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
