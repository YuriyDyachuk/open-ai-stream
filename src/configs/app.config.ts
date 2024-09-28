import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModuleAsyncOptions } from '@nestjs/sequelize/dist/interfaces/sequelize-options.interface';
import { ServeStaticModuleOptions } from '@nestjs/serve-static/dist/interfaces/serve-static-options.interface';

import { User, Assistant, UserAiRequest } from '../database/entities';

const models = [
  User,
  Assistant,
  UserAiRequest
];

export const sequelizeAsyncRootConfig = (): SequelizeModuleAsyncOptions => ({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    return {
      dialect: 'mysql',
      host: configService.get<string>('DB_HOST'),
      port: Number(configService.get<number>('DB_PORT')),
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_NAME'),
      models,
      define: {
        timestamps: true,
      },
      logging:
        configService.get<string>('DB_LOGS_SHOW') === 'true'
          ? console.log
          : false,
    };
  },
  inject: [ConfigService],
});

export const serveStaticConfig = (): ServeStaticModuleOptions[] => {
  return [
    {
      serveRoot: '/uploads',
      rootPath: join(__dirname, '..', '..', 'uploads'),
      exclude: ['/api*', 'api*', '/static*'],
    },
    {
      serveRoot: '',
      rootPath: join(__dirname, '..', '..', 'dist_frontend'),
      exclude: ['/api*', '/uploads*', '/static*'],
    },
  ];
};
