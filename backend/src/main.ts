import * as dotenv from 'dotenv';
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import type { Request, Response, NextFunction } from 'express';

// ─── Helper: HTTP Basic Auth middleware factory ───────────────────────────────
function basicAuthMiddleware(user: string, pass: string, realm: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
      res.status(401).send('Acceso restringido. Se requieren credenciales.');
      return;
    }

    const base64 = authHeader.slice('Basic '.length);
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const [reqUser, reqPass] = decoded.split(':');

    if (reqUser === user && reqPass === pass) {
      next();
    } else {
      res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
      res.status(401).send('Credenciales incorrectas.');
    }
  };
}
// ─────────────────────────────────────────────────────────────────────────────

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

  // ═══════════════════════════════════════════════════════════════════════════
  // SWAGGER 1 — SUPERADMIN  →  /api/superadmin
  //   Credenciales: superadmin / super123
  //   Acceso: TODOS los endpoints (auth, businesses, services, appointments,
  //           customers, payments, users, logs)
  // ═══════════════════════════════════════════════════════════════════════════
  const superadminUser = process.env.SWAGGER_SUPERADMIN_USER || 'superadmin';
  const superadminPass = process.env.SWAGGER_SUPERADMIN_PASS || 'super123';

  app.use('/api/superadmin', basicAuthMiddleware(
    superadminUser,
    superadminPass,
    'BookFlow — Superadmin Docs',
  ));

  const superadminConfig = new DocumentBuilder()
    .setTitle('BookFlow API — Superadmin')
    .setDescription(
      '🔴 Panel completo de la API. Acceso total a todos los endpoints.\n\n' +
      '**Credenciales por defecto (dev):** `superadmin` / `super123`',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // Superadmin sees ALL tags
  const superadminDocument = SwaggerModule.createDocument(app, superadminConfig, {
    include: [], // empty = include everything
  });
  SwaggerModule.setup('api/superadmin', app, superadminDocument, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SWAGGER 2 — BUSINESS (admin de negocio)  →  /api/business
  //   Credenciales: business / biz123
  //   Acceso: auth, businesses, services, appointments, customers, payments
  //   NO puede ver: users (gestión de cuentas), logs (auditoría del sistema)
  // ═══════════════════════════════════════════════════════════════════════════
  const businessUser = process.env.SWAGGER_BUSINESS_USER || 'business';
  const businessPass = process.env.SWAGGER_BUSINESS_PASS || 'biz123';

  app.use('/api/business', basicAuthMiddleware(
    businessUser,
    businessPass,
    'BookFlow — Business Docs',
  ));

  const businessConfig = new DocumentBuilder()
    .setTitle('BookFlow API — Negocio')
    .setDescription(
      '🟡 Panel de la API para administradores de negocio.\n\n' +
      'Incluye: auth, negocios, servicios, reservas, clientes y pagos.\n\n' +
      '**No incluye:** gestión de cuentas de usuario ni logs del sistema.\n\n' +
      '**Credenciales por defecto (dev):** `business` / `biz123`',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // Business sees only business-relevant tags
  const BUSINESS_TAGS = ['auth', 'businesses', 'services', 'appointments', 'customers', 'payments'];

  const fullDocument = SwaggerModule.createDocument(app, businessConfig);

  // Filter out paths that only belong to superadmin-only tags (users, logs)
  const businessPaths: Record<string, any> = {};
  for (const [path, pathItem] of Object.entries(fullDocument.paths)) {
    const methods = Object.values(pathItem as Record<string, any>);
    const hasBusinessTag = methods.some((op: any) =>
      Array.isArray(op?.tags) && op.tags.some((t: string) => BUSINESS_TAGS.includes(t)),
    );
    if (hasBusinessTag) {
      businessPaths[path] = pathItem;
    }
  }

  const businessDocument = { ...fullDocument, paths: businessPaths };
  SwaggerModule.setup('api/business', app, businessDocument, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Redirect /api → informative landing (no longer a direct Swagger access)
  // ═══════════════════════════════════════════════════════════════════════════
  app.use('/api', (req: Request, res: Response) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <title>BookFlow API Docs</title>
        <style>
          body { font-family: sans-serif; background: #0b0d11; color: #f8fafc; display: flex;
                 flex-direction: column; align-items: center; justify-content: center;
                 min-height: 100vh; margin: 0; }
          h1 { color: #6366f1; }
          a { display: inline-block; margin: 12px; padding: 14px 28px; border-radius: 12px;
              text-decoration: none; font-weight: 600; font-size: 15px; }
          .sa { background: #6366f1; color: white; }
          .biz { background: #f59e0b; color: #0b0d11; }
        </style>
      </head>
      <body>
        <h1>📚 BookFlow API Docs</h1>
        <p>Selecciona el nivel de acceso:</p>
        <a class="sa" href="/api/superadmin">🔴 Superadmin — Acceso total</a>
        <a class="biz" href="/api/business">🟡 Negocio — Acceso restringido</a>
      </body>
      </html>
    `);
  });

  await app.listen(3000, () => {
    console.log('✅ NestJS Backend running on http://localhost:3000');
    console.log('📚 Swagger Superadmin → http://localhost:3000/api/superadmin  (superadmin / super123)');
    console.log('📚 Swagger Business   → http://localhost:3000/api/business   (business / biz123)');
  });
}
bootstrap();