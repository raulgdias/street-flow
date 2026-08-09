import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { shouldSynchronizeSchema } from './shared/database/postgres.config';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3000);
  console.info(
    `[bootstrap] iniciando Street Flow API: node=${process.version} env=${process.env.NODE_ENV ?? 'development'} port=${port}`,
  );

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });
  const dataSource = app.get(DataSource);

  console.info(
    `[database] conexão estabelecida; entities=${dataSource.entityMetadatas.map((entity) => entity.tableName).join(',')}`,
  );

  if (shouldSynchronizeSchema()) {
    console.info('[database] sincronizando schema...');
    await dataSource.synchronize(false);
    console.info('[database] schema sincronizado com sucesso');
  } else {
    console.warn(
      '[database] sincronização desabilitada por TYPEORM_SYNCHRONIZE=false',
    );
  }

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Street Flow API')
    .setDescription('BFF API with NestJS and shared contracts')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port, '0.0.0.0');
  console.info(`[bootstrap] API disponível na porta ${port}`);
}

void bootstrap().catch((error: unknown) => {
  const details =
    error instanceof Error
      ? `${error.name}: ${error.message}\n${error.stack ?? ''}`
      : String(error);
  console.error(`[bootstrap] erro fatal durante a inicialização\n${details}`);
  process.exitCode = 1;
});
