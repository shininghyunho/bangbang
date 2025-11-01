import { NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
    console.log('로그 기록입니다!');
    next();
}