import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('API Error Logging: ', err.message);

  const statusCode = err.status || 400;
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected server occurred.'
  })
}