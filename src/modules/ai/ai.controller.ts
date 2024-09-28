import {
  Body,
  Post,
  Controller,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { User } from '../../database/entities';
import { RolesGuard } from '../../guards/roles.guard';
import { SuccessResponseDTO } from '../../responses/resp.lib';
import { RequestUser } from '../../decorators/user.decorator';
import {
  GeneratedAiTextDTO,
} from './ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('actions-on-text')
  @UseGuards(RolesGuard)
  async getGeneratedAiText(
    @Body() data: GeneratedAiTextDTO,
    @RequestUser() user: User,
  ): Promise<SuccessResponseDTO> {
    return await this.aiService.generatedAiText(data, user);
  }
}
