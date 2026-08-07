import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { PostgresModule } from './shared/database/postgres.module';
import { AuthModule } from './auth/auth.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [CustomersModule, PostgresModule, AuthModule, StoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
