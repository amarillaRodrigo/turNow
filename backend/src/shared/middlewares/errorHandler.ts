import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../errors/ApiError.js";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
){
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
}