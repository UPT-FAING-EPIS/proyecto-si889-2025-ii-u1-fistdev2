import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService } from './común/logger.service';

/**
 * Bootstrap de la aplicación DevFlow
 * Configura el servidor NestJS con todas las funcionalidades necesarias
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar logger personalizado
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // Configurar CORS para desarrollo
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: process.env.NODE_ENV === 'production',
  }));

  // Configurar prefijo global para la API
  app.setGlobalPrefix('api/v1');

  // Configurar Swagger para documentación
  const config = new DocumentBuilder()
    .setTitle('DevFlow System API')
    .setDescription('API completa del sistema de desarrollo web auto-hospedado')
    .setVersion('1.0.0')
    .addTag('Authentication', 'Endpoints de autenticación y autorización')
    .addTag('Application', 'Endpoints básicos de la aplicación')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'DevFlow API Documentation',
  });

  // Configurar puerto
  const port = process.env.PORT || 3001;
  
  await app.listen(port);
  
  logger.log(`🚀 DevFlow System iniciado en puerto ${port}`, 'Bootstrap');
  logger.log(`📚 Documentación disponible en: http://localhost:${port}/api/docs`, 'Bootstrap');
  logger.log(`🔗 API base URL: http://localhost:${port}/api/v1`, 'Bootstrap');
  
  // Log del estado inicial
  logger.log('✅ Sistema iniciado exitosamente', 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('❌ Error iniciando la aplicación:', error);
  process.exit(1);
});
