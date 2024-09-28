import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { BadRequestExceptionFilter } from './exceptions/filters/bad-request.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new BadRequestExceptionFilter());

  const configService: ConfigService = app.get(ConfigService);

  const PORT = configService.get<number>('PORT');
  await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
bootstrap();
