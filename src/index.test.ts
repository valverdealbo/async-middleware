/* eslint-disable import/no-extraneous-dependencies,@typescript-eslint/no-explicit-any */
import express, { Request, Response, NextFunction } from 'express';
import supertest from 'supertest';
import { asyncMiddleware, asyncErrorMiddleware } from '.';

const mockResolveMiddleware = jest.fn((request: Request, response: Response) => {
  response.json({ ok: true });
  return Promise.resolve();
});

const mockRejectMiddleware = jest.fn(() => Promise.reject(new Error('rejected')));

const mockErrorResolveMiddleware = jest.fn((error: any, request: Request, response: Response) => {
  response.json({ ok: true });
  return Promise.resolve();
});

const mockErrorRejectMiddleware = jest.fn(() => Promise.reject(new Error('rejected')));

const errorThrower = (request: Request, response: Response, next?: NextFunction): any => {
  if (next !== undefined) {
    next(new Error());
  }
};

const errorHandler = (error: any, request: Request, response: Response, next?: NextFunction) => {
  response.json({ error: error.message });
};

beforeEach(() => {
  mockResolveMiddleware.mockClear();
  mockRejectMiddleware.mockClear();
  mockErrorResolveMiddleware.mockClear();
  mockErrorRejectMiddleware.mockClear();
});

describe('asyncMiddleware()', () => {
  test('should resolve the provided async middleware', async () => {
    const app = express();
    app.use(asyncMiddleware(mockResolveMiddleware));
    const response = await supertest(app).get('/');
    expect(response.body).toEqual({ ok: true });
    expect(mockResolveMiddleware).toHaveBeenCalled();
  });

  test('should capture a thrown error in the provided async middleware and call next with it', async () => {
    const app = express();
    app.use(asyncMiddleware(mockRejectMiddleware));
    app.use(errorHandler);
    const response = await supertest(app).get('/');
    expect(response.body).toEqual({ error: 'rejected' });
    expect(mockRejectMiddleware).toHaveBeenCalled();
  });
});

describe('asyncErrorMiddleware()', () => {
  test('should resolve the provided async error middleware', async () => {
    const app = express();
    app.use(errorThrower);
    app.use(asyncErrorMiddleware(mockErrorResolveMiddleware));
    const response = await supertest(app).get('/');
    expect(response.body).toEqual({ ok: true });
    expect(mockErrorResolveMiddleware).toHaveBeenCalled();
  });

  test('should capture a thrown error in the provided async error middleware and call next with it', async () => {
    const app = express();
    app.use(errorThrower);
    app.use(asyncErrorMiddleware(mockErrorRejectMiddleware));
    app.use(errorHandler);
    const response = await supertest(app).get('/');
    expect(response.body).toEqual({ error: 'rejected' });
    expect(mockErrorRejectMiddleware).toHaveBeenCalled();
  });
});
