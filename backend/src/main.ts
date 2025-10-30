import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import { initializeTransactionalContext, addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // TypeORM DataSource를 가져와 typeorm-transactional에 등록
  const dataSource = app.get<DataSource>(getDataSourceToken());
  addTransactionalDataSource(dataSource);

  // 세션 미들웨어 설정
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'BANGBANG_SESSION_SECRE',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // 1시간 (밀리초)
        httpOnly: true, // 클라이언트 스크립트에서 쿠키 접근 방지
        secure: process.env.NODE_ENV === 'production', // HTTPS에서만 쿠키 전송 (배포 환경에서 true)
        sameSite: 'lax', // CSRF 보호
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();