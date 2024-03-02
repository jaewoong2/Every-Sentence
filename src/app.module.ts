import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmConfigService, authConfig, awsConfig } from './config';
import { AuthModule } from './auth/auth.module';
import { SentenceModule } from './sentence/sentence.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [awsConfig, authConfig],
    }),
    AuthModule,
    SentenceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
