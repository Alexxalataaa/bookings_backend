import * as dotenv from 'dotenv';
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Configuration
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ─── Swagger Basic Auth Protection ───────────────────────────────────────
  // Credentials are read from env vars so they can be changed without
  // touching code. Defaults are only for local dev — set real values in prod.
  const swaggerUser = process.env.SWAGGER_USER || 'admin';
  const swaggerPass = process.env.SWAGGER_PASS || 'bookflow-dev-2024';

  app.use(
    '/api',
    (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers['authorization'];

      if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="BookFlow Swagger Docs"');
        res.status(401).send('Acceso restringido. Se requieren credenciales.');
        return;
      }

      const base64 = authHeader.slice('Basic '.length);
      const decoded = Buffer.from(base64, 'base64').toString('utf-8');
      const [user, pass] = decoded.split(':');

      if (user === swaggerUser && pass === swaggerPass) {
        next();
      } else {
        res.setHeader('WWW-Authenticate', 'Basic realm="BookFlow Swagger Docs"');
        res.status(401).send('Credenciales incorrectas.');
      }
    },
  );
  // ─────────────────────────────────────────────────────────────────────────

  const config = new DocumentBuilder()
    .setTitle('Booking Management API')
    .setDescription('API MVP para gestión de reservas de comercios')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000, () => {
    console.log('✅ NestJS Backend running on http://localhost:3000');
    console.log('📚 Swagger API docs on http://localhost:3000/api (protegido con contraseña)');
  });
}
bootstrap();