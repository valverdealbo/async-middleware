/* eslint-disable import/no-extraneous-dependencies,@typescript-eslint/no-explicit-any */
import express, { Request, Response, NextFunction } from 'express';
import supertest from 'supertest';
import { asyncMiddleware, asyncErrorMiddleware } from '../src';

const mockResolveMiddleware = jest.fn(async (request: Request, response: Response) => {
  response.json({ ok: true });
});

const mockErrorResolveMiddleware = jest.fn(async (error: any, request: Request, response: Response) => {
  response.json({ ok: true });
});

const mockRejectMiddleware = jest.fn(async () => {
  throw new Error('rejected');
});

const errorThrower = (request: Request, response: Response, next?: NextFunction): any => {
  if (next !== undefined) {
    next(new Error());
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (error: any, request: Request, response: Response, next?: NextFunction) => {
  response.status(500).json({ error: error.message });
};

beforeEach(() => {
  mockResolveMiddleware.mockClear();
  mockErrorResolveMiddleware.mockClear();
  mockRejectMiddleware.mockClear();
});

describe('asyncMiddleware()', () => {
  test('should resolve the provided async middleware', async () => {
    const app = express();
    app.use(asyncMiddleware(mockResolveMiddleware));
    const response = await supertest(app).get('/');
    expect(response.status).toBe(200);
    expect(mockResolveMiddleware).toHaveBeenCalled();
  });

  test('should capture a thrown error in the provided async middleware and call next with it', async () => {
    const app = express();
    app.use(asyncMiddleware(mockRejectMiddleware));
    app.use(errorHandler);
    const response = await supertest(app).get('/');
    expect(response.status).toBe(500);
    expect(mockRejectMiddleware).toHaveBeenCalled();
  });
});

describe('asyncErrorMiddleware()', () => {
  test('should resolve the provided async error middleware', async () => {
    const app = express();
    app.use(errorThrower);
    app.use(asyncErrorMiddleware(mockErrorResolveMiddleware));
    const response = await supertest(app).get('/');
    expect(response.status).toBe(200);
    expect(mockErrorResolveMiddleware).toHaveBeenCalled();
  });

  test('should capture a thrown error in the provided async error middleware and call next with it', async () => {
    const app = express();
    app.use(errorThrower);
    app.use(asyncErrorMiddleware(mockRejectMiddleware));
    app.use(errorHandler);
    const response = await supertest(app).get('/');
    expect(response.status).toBe(500);
    expect(mockRejectMiddleware).toHaveBeenCalled();
  });
});
