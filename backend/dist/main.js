"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const path = __importStar(require("path"));
function basicAuthMiddleware(user, pass, realm) {
    return (req, res, next) => {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Basic ')) {
                res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
                res.status(401).send('Acceso restringido. Se requieren credenciales.');
                return;
            }
            const base64 = authHeader.slice('Basic '.length);
            const decoded = Buffer.from(base64, 'base64').toString('utf-8');
            const [reqUser, reqPass] = decoded.split(':');
            if (reqUser === user && reqPass === pass) {
                next();
            }
            else {
                res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
                res.status(401).send('Credenciales incorrectas.');
            }
        }
        catch (err) {
            console.error('Auth middleware error:', err);
            res.status(500).send(`Auth error: ${err.message}`);
        }
    };
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use('/light_krono.png', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'light_krono.png'));
    });
    app.enableCors({
        origin: [
            'http://localhost:3001',
            'http://localhost:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3000',
            'http://[::1]:3001',
            'http://[::1]:3000',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const superadminUser = process.env.SWAGGER_SUPERADMIN_USER || 'superadmin';
    const superadminPass = process.env.SWAGGER_SUPERADMIN_PASS || 'super123';
    app.use('/api/superadmin', basicAuthMiddleware(superadminUser, superadminPass, 'BookFlow - Superadmin Docs'));
    const superadminConfig = new swagger_1.DocumentBuilder()
        .setTitle('Krono API — Superadmin')
        .setDescription('🔴 Panel completo de la API. Acceso total a todos los endpoints.\n\n' +
        '**Credenciales por defecto (dev):** `superadmin` / `super123`')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const superadminDocument = swagger_1.SwaggerModule.createDocument(app, superadminConfig, {
        include: [],
    });
    swagger_1.SwaggerModule.setup('api/superadmin', app, superadminDocument, {
        swaggerOptions: { persistAuthorization: true },
        customfavIcon: '/light_krono.png',
        customSiteTitle: 'Krono API — Superadmin',
    });
    const businessUser = process.env.SWAGGER_BUSINESS_USER || 'business';
    const businessPass = process.env.SWAGGER_BUSINESS_PASS || 'biz123';
    app.use('/api/business', basicAuthMiddleware(businessUser, businessPass, 'BookFlow - Business Docs'));
    const businessConfig = new swagger_1.DocumentBuilder()
        .setTitle('Krono API — Negocio')
        .setDescription('🟡 Panel de la API para administradores de negocio.\n\n' +
        'Incluye: auth, negocios, servicios, reservas, clientes y pagos.\n\n' +
        '**No incluye:** gestión de cuentas de usuario ni logs del sistema.\n\n' +
        '**Credenciales por defecto (dev):** `business` / `biz123`')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const BUSINESS_TAGS = ['auth', 'businesses', 'services', 'appointments', 'customers', 'payments'];
    const fullDocument = swagger_1.SwaggerModule.createDocument(app, businessConfig);
    const businessPaths = {};
    for (const [path, pathItem] of Object.entries(fullDocument.paths)) {
        const methods = Object.values(pathItem);
        const hasBusinessTag = methods.some((op) => Array.isArray(op?.tags) && op.tags.some((t) => BUSINESS_TAGS.includes(t)));
        if (hasBusinessTag) {
            businessPaths[path] = pathItem;
        }
    }
    const businessDocument = { ...fullDocument, paths: businessPaths };
    swagger_1.SwaggerModule.setup('api/business', app, businessDocument, {
        swaggerOptions: { persistAuthorization: true },
        customfavIcon: '/light_krono.png',
        customSiteTitle: 'Krono API — Negocio',
    });
    app.use('/api', (req, res, next) => {
        if (req.path === '/' || req.path === '') {
            res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Krono API Docs</title>
        <link rel="icon" type="image/png" href="/light_krono.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
            background-color: #09090b; 
            color: #f8fafc; 
            display: flex;
            align-items: center; 
            justify-content: center;
            min-height: 100vh;
            overflow: hidden;
            position: relative;
          }
          
          /* Ambient Background Glow */
          .glow-1 {
            position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%);
            top: -200px; left: -200px; z-index: 0; border-radius: 50%;
          }
          .glow-2 {
            position: absolute; width: 500px; height: 500px; background: radial-gradient(circle, rgba(245,158,11,0.1) 0%, rgba(0,0,0,0) 70%);
            bottom: -150px; right: -100px; z-index: 0; border-radius: 50%;
          }

          .container {
            position: relative;
            z-index: 10;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 48px 40px;
            width: 100%;
            max-width: 440px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }

          .logo-container {
            display: flex; justify-content: center; margin-bottom: 24px;
          }
          .logo-icon {
            width: auto; height: auto;
            background: transparent;
            box-shadow: none;
            display: flex; align-items: center; justify-content: center;
          }
          .logo-icon img {
            width: 56px; height: 56px;
            border-radius: 12px;
            object-fit: cover;
          }

          h1 { 
            font-size: 28px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.02em;
            background: linear-gradient(to right, #ffffff, #a1a1aa);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          }
          
          p.subtitle { 
            color: #a1a1aa; font-size: 15px; margin-bottom: 40px; line-height: 1.5;
          }

          .btn-group { display: flex; flex-direction: column; gap: 16px; }

          a.btn {
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 24px; border-radius: 14px; text-decoration: none;
            font-weight: 600; font-size: 15px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative; overflow: hidden;
          }
          
          .btn-icon { display: flex; align-items: center; gap: 12px; }

          .btn-sa { 
            background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1));
            color: #e0e7ff; border: 1px solid rgba(99, 102, 241, 0.3);
          }
          .btn-sa:hover { 
            background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white;
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4); transform: translateY(-2px);
          }

          .btn-biz { 
            background: linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(202, 138, 4, 0.1));
            color: #ffedd5; border: 1px solid rgba(245, 158, 11, 0.3);
          }
          .btn-biz:hover { 
            background: linear-gradient(135deg, #ea580c, #ca8a04); color: white;
            box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.4); transform: translateY(-2px);
          }

          /* Arrow icon */
          .arrow { opacity: 0.5; transition: all 0.3s ease; }
          .btn:hover .arrow { opacity: 1; transform: translateX(4px); }

          .footer-note { margin-top: 32px; font-size: 13px; color: #52525b; }
        </style>
      </head>
      <body>
        <div class="glow-1"></div>
        <div class="glow-2"></div>
        
        <div class="container">
          <div class="logo-container">
            <div class="logo-icon">
              <img src="/light_krono.png" alt="Krono Logo" />
            </div>
          </div>
          
          <h1>Krono API</h1>
          <p class="subtitle">Selecciona el entorno de documentación correspondiente a tus credenciales de acceso.</p>
          
          <div class="btn-group">
            <a class="btn btn-sa" href="/api/superadmin">
              <div class="btn-icon">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span>Acceso Superadmin</span>
              </div>
              <svg class="arrow" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
            
            <a class="btn btn-biz" href="/api/business">
              <div class="btn-icon">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <span>Acceso Negocio</span>
              </div>
              <svg class="arrow" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
          </div>
          
          <div class="footer-note">Requiere autorización HTTP Basic Auth</div>
        </div>
      </body>
      </html>
    `);
        }
        else {
            next();
        }
    });
    await app.listen(3000, () => {
        console.log('✅ NestJS Backend running on http://localhost:3000');
        console.log('📚 Swagger Superadmin → http://localhost:3000/api/superadmin  (superadmin / super123)');
        console.log('📚 Swagger Business   → http://localhost:3000/api/business   (business / biz123)');
    });
}
bootstrap();
//# sourceMappingURL=main.js.map