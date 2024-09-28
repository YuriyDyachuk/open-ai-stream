import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Assistant,
  UserAiRequest,
} from '../../database/entities';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Assistant,
      UserAiRequest,
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
