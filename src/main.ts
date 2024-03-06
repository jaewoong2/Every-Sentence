import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ServiceExceptionToHttpExceptionFilter } from './common/exception-filter';
import cookieParser from 'cookie-parser';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Example API')
    .setDescription('The example API description')
    .setVersion('1.0')
    .addTag('example')
    .build();

  app.use(cookieParser());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO 에 작성된 값만 수신
      forbidNonWhitelisted: true, // DTO 에 필수 값이 안들어오면 막기
      transform: true, // DTO Type 에 맞게 수신 값 변경
    }),
  );

  app.enableCors({
    origin: ['https://prlc.kr', 'http://localhost:3001'],
    credentials: true,
    exposedHeaders: ['Authorization'], // * 사용할 헤더 추가.
  });

  app.useGlobalFilters(new ServiceExceptionToHttpExceptionFilter());

  return app;
}

async function run() {
  const nestApp = await bootstrap();
  await nestApp.listen(3000);
}

run();
