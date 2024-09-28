import { AppService } from './app.service';
import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {
  sequelizeAsyncRootConfig,
  serveStaticConfig,
} from './configs/app.config';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './modules/ai/ai.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtStrategy } from './guards/jwt.strategy';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';

import {
  Assistant,
  User,
  UserAiRequest,
} from './database/entities';
import { AiConsumer } from './ai.consumer';
import configuration from './configs/open-ai-conf';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue(
      {
        name: 'ai-queue',
      },
    ),
    ConfigModule.forRoot({ isGlobal: true }),
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync(sequelizeAsyncRootConfig()),
    SequelizeModule.forFeature([
      User,
      Assistant,
      UserAiRequest,
    ]),
    ServeStaticModule.forRoot(...serveStaticConfig()),
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    AiConsumer,
  ],
  exports: [BullModule],
})
@Global()
export class AppModule {}
