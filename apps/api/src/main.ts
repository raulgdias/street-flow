import { execSync } from 'child_process';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './app.module';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

function getPrismaBinary() {
  const isWindows = process.platform === 'win32';
  return isWindows ? 'npx.cmd' : 'npx';
}

async function ensureDatabaseSchema() {
  const shouldSyncDb = process.env.NODE_ENV === 'production' || process.env.PRISMA_SYNC_DB === 'true';

  if (!shouldSyncDb) {
    return;
  }

  const apiRoot = join(__dirname, '..', '..');
  const prismaSchema = join(apiRoot, 'prisma', 'schema.prisma');
  const prismaEnv = { ...process.env, DATABASE_URL: process.env.DATABASE_URL ?? '' };

  console.log('Synchronizing Prisma schema with the database...');
  execSync(`${getPrismaBinary()} prisma db push --schema ${prismaSchema} --accept-data-loss --skip-generate`, {
    cwd: apiRoot,
    stdio: 'inherit',
    env: prismaEnv,
  });
}

async function bootstrap() {
  await ensureDatabaseSchema();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadPath = join(__dirname, '..', 'uploads');
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }

  app.use('/uploads', express.static(uploadPath));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Street Flow API')
    .setDescription('BFF API with NestJS and shared contracts')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
