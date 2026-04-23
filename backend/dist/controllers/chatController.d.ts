import { Request, Response } from 'express';
export declare const chat: (req: Request, res: Response) => Promise<void>;
export declare const getChatHistory: (req: Request, res: Response) => Promise<void>;
export declare const clearChatHistory: (req: Request, res: Response) => Promise<void>;
