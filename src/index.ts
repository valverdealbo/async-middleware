/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';

export interface AsyncRequestHandler {
  (request: Request, response: Response, next: NextFunction): Promise<unknown>;
}

export interface AsyncErrorRequestHandler {
  (error: any, request: Request, response: Response, next: NextFunction): Promise<unknown>;
}

export function asyncMiddleware(middleware: AsyncRequestHandler): RequestHandler {
  return (request: Request, response: Response, next: NextFunction): void => {
    Promise.resolve(middleware(request, response, next)).catch(next);
  };
}

export function asyncErrorMiddleware(middleware: AsyncErrorRequestHandler): ErrorRequestHandler {
  return (error: any, request: Request, response: Response, next: NextFunction): void => {
    Promise.resolve(middleware(error, request, response, next)).catch(next);
  };
}
