# @valbo/async-middleware

Use async middlewares with express.

![npm (scoped)](https://img.shields.io/npm/v/@valbo/async-middleware)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
![Build Status](https://img.shields.io/github/workflow/status/valverdealbo/async-middleware/CI)
[![Coverage Status](https://coveralls.io/repos/github/valverdealbo/async-middleware/badge.svg?branch=main)](https://coveralls.io/github/valverdealbo/async-middleware?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/valverdealbo/async-middleware/badge.svg?targetFile=package.json)](https://snyk.io/test/github/valverdealbo/async-middleware?targetFile=package.json)

## Install

```bash
npm install @valbo/async-middleware
```

## Usage

Exports wrappers that allows you to use async functions as express middlewares. If the wrapped middlewares throw, the error will be catched and passed to next().

```typescript
import express, { Request, Response, NextFunction } from 'express';
import { asyncMiddleware, asyncErrorMiddleware, AsyncRequestHandler, AsyncErrorRequestHandler } from '@valbo/async-middleware';

const getUser: AsyncRequestHandler = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  response.locals.user = await database.getUser();
  next();
};

const errorHandler: AsyncErrorRequestHandler = async (error: any, request: Request, response: Response, next: NextFunction): Promise<void> => {
  if (error.report) {
    await remoteAlerts.report(error);
  }
  response.status(error.status);
  response.json({ error: { status: error.status, name: error.name, message: error.message } });
};

const app = express();

app.use(asyncMiddleware(getUser));
app.use(asyncErrorMiddleware(errorHandler));
```
