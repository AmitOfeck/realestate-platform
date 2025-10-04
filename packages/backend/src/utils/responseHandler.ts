import { Response } from 'express';
import { ApiResponse } from '../../../../types/Property';

export class ResponseHandler {
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(message && { message })
    };
    res.status(statusCode).json(response);
  }

  static error(res: Response, error: string, statusCode: number = 500): void {
    const response: ApiResponse<null> = {
      success: false,
      data: null as any,
      error
    };
    res.status(statusCode).json(response);
  }

  static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, 404);
  }

  static badRequest(res: Response, message: string = 'Bad request'): void {
    this.error(res, message, 400);
  }

  static internalError(res: Response, message: string = 'Internal server error'): void {
    this.error(res, message, 500);
  }
}
