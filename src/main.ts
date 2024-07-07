import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000', // 允许来自这个域的请求
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许这些 HTTP 方法
    allowedHeaders: ['Content-Type', 'Authorization'], // 允许这些请求头
    credentials: true, // 允许跨域请求携带 cookie
  });
  await app.listen(3000);
}

bootstrap();
