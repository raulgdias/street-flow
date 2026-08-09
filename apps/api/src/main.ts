import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { createServer, type Server } from 'node:http';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { shouldSynchronizeSchema } from './shared/database/postgres.config';

type BootstrapStatus = {
  status: 'starting' | 'error';
  phase: string;
  message?: string;
  code?: string;
  updatedAt: string;
};

let bootstrapStatus: BootstrapStatus = {
  status: 'starting',
  phase: 'process_start',
  updatedAt: new Date().toISOString(),
};

function updateBootstrapStatus(
  phase: string,
  details: Partial<Pick<BootstrapStatus, 'status' | 'message' | 'code'>> = {},
) {
  bootstrapStatus = {
    status: details.status ?? 'starting',
    phase,
    message: details.message,
    code: details.code,
    updatedAt: new Date().toISOString(),
  };
}

function sanitizeError(error: unknown): {
  details: string;
  message: string;
  code?: string;
} {
  const rawDetails =
    error instanceof Error
      ? `${error.name}: ${error.message}\n${error.stack ?? ''}`
      : String(error);
  const details = rawDetails
    .replace(/(postgres(?:ql)?:\/\/)[^@\s]+@/gi, '$1***@')
    .replace(/(password\s*[:=]\s*)[^,\s}]+/gi, '$1***');
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : undefined;
  const publicMessage = (
    error instanceof Error
      ? details.split('\n', 1)[0]
      : 'Erro desconhecido durante a inicialização'
  )
    .replace(/(getaddrinfo\s+\w+\s+)\S+/gi, '$1[database-host]')
    .replace(/(connect\s+\w+\s+)\S+/gi, '$1[database-host]')
    .replace(/(for user\s+)"[^"]+"/gi, '$1"***"')
    .replace(/(database\s+)"[^"]+"/gi, '$1"***"');

  return {
    details,
    message: publicMessage,
    code,
  };
}

async function startBootstrapServer(port: number): Promise<Server> {
  const server = createServer((request, response) => {
    const isAzureWarmup =
      request.url === '/' || request.url?.startsWith('/robots933456.txt');

    response.statusCode = isAzureWarmup ? 200 : 503;
    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.setHeader('cache-control', 'no-store');
    response.end(
      JSON.stringify({
        service: 'street-flow-api',
        ...bootstrapStatus,
      }),
    );
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '0.0.0.0', () => {
      server.off('error', reject);
      resolve();
    });
  });

  console.info(`[bootstrap] servidor de diagnóstico ativo na porta ${port}`);
  return server;
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3000);
  console.info(
    `[bootstrap] iniciando Street Flow API: node=${process.version} env=${process.env.NODE_ENV ?? 'development'} port=${port}`,
  );

  const bootstrapServer = await startBootstrapServer(port);
  updateBootstrapStatus('database_connection');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });
  const dataSource = app.get(DataSource);

  console.info(
    `[database] conexão estabelecida; entities=${dataSource.entityMetadatas.map((entity) => entity.tableName).join(',')}`,
  );

  if (shouldSynchronizeSchema()) {
    updateBootstrapStatus('schema_synchronization');
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

  updateBootstrapStatus('application_start');
  await closeServer(bootstrapServer);
  await app.listen(port, '0.0.0.0');
  console.info(`[bootstrap] API disponível na porta ${port}`);
}

void bootstrap().catch((error: unknown) => {
  const { details, message, code } = sanitizeError(error);
  updateBootstrapStatus('failed', {
    status: 'error',
    message,
    code,
  });
  console.error(`[bootstrap] erro fatal durante a inicialização\n${details}`);
  process.exitCode = 1;
});
