import { Type, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { BunyanLoggerService } from '@eropple/nestjs-bunyan-logger';

import { ROOT_LOGGER } from './logging';

export async function buildApp(
  rootModule: Type<any>,
): Promise<INestApplication> {
  const app = await NestFactory.create(rootModule, {
    logger: new BunyanLoggerService(ROOT_LOGGER),
  });

  return app;
}

export async function configureApp(
  app: INestApplication,
): Promise<INestApplication> {
  return app;
}
