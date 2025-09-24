"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const logger_service_1 = require("./com\u00FAn/logger.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = app.get(logger_service_1.LoggerService);
    app.useLogger(logger);
    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
    }));
    app.setGlobalPrefix('api/v1');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('DevFlow System API')
        .setDescription('API completa del sistema de desarrollo web auto-hospedado')
        .setVersion('1.0.0')
        .addTag('Authentication', 'Endpoints de autenticación y autorización')
        .addTag('Application', 'Endpoints básicos de la aplicación')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'DevFlow API Documentation',
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`🚀 DevFlow System iniciado en puerto ${port}`, 'Bootstrap');
    logger.log(`📚 Documentación disponible en: http://localhost:${port}/api/docs`, 'Bootstrap');
    logger.log(`🔗 API base URL: http://localhost:${port}/api/v1`, 'Bootstrap');
    logger.log('✅ Sistema iniciado exitosamente', 'Bootstrap');
}
bootstrap().catch((error) => {
    console.error('❌ Error iniciando la aplicación:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map