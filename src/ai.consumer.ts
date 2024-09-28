import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import {
  Assistant,
  UserAiRequest,
} from './database/entities';
import { InjectModel } from '@nestjs/sequelize';
import {
  sendIoSystemMessage,
} from './tools/pure-functions';
import { AiService } from './modules/ai/ai.service';
import { Sequelize } from 'sequelize-typescript';

@Processor('ai-queue')
export class AiConsumer {
  constructor(
    @InjectModel(Assistant)
    private readonly assistantRepo: typeof Assistant,
    @InjectModel(UserAiRequest)
    private readonly aiRequestRepo: typeof UserAiRequest,
    @InjectQueue('ai-queue')
    private readonly aiQueue: Queue,
    private readonly aiService: AiService,
  ) {}

  @Process('process-message-ai-thread-job')
  async processMessageAiThread(
    job: Job<{
      text: string;
      person_id?: number;
      prompt_id?: number;
      user_id: number;
      type_event: string;
    }>,
  ) {
    let value = null;
    const {
      text,
      person_id = null,
      prompt_id = null,
      user_id,
      type_event,
    } = job.data;
    const user_ai_request = await this.aiRequestRepo.create({
      user_id,
      request_text: text,
      status: null,
    });
    try {
      await sendIoSystemMessage(user_id, {
        event: 'is_ai_request_in_progress',
        value: true,
      });

      if (type_event === 'ai_ask_response') {
        value = await this.aiService.runAssistantJob(
          job.data,
          user_ai_request,
          (intermediateData) => {
            sendIoSystemMessage(user_id, {
              event: 'intermediate_ai_response',
              value: intermediateData,
            });
          },
        );
      }

      await sendIoSystemMessage(user_id, {
        event: type_event,
        value,
      });
      user_ai_request.response_text = value;
      user_ai_request.status = 'completed';
      user_ai_request.updatedAt = Sequelize.literal('CURRENT_TIMESTAMP');
      await user_ai_request.save();
      await sendIoSystemMessage(user_id, {
        event: 'is_ai_request_in_progress',
        value: false,
      });
    } catch (e) {
      console.log(e);
      user_ai_request.status = 'failed';
      user_ai_request.updatedAt = Sequelize.literal('CURRENT_TIMESTAMP');
      await user_ai_request.save();

      await sendIoSystemMessage(user_id, {
        event: 'is_ai_request_in_progress',
        value: false,
      });

      if (e.code === 'insufficient_quota') {
        console.error(
          'Insufficient quota, please check your plan and billing details.',
        );
        await sendIoSystemMessage(user_id, {
          event: 'is_ai_request_in_error',
          value: 'Insufficient quota, please try again later.',
        });
      }
    }
  }

  @Process('check-user-assistant-job')
  async makeUserAssistantIfNotExists(job: Job<{ user_id: number }>) {
    try {
      const { user_id } = job.data;
      const user_assistant = await this.assistantRepo.findOne({
        where: {
          user_id,
        },
      });

      if (user_assistant) {
        return;
      }

      const assistant = await this.aiService.makeAssistantForCustomer(user_id);

      if (!assistant) {
        return;
      }

      const {
        id: assistant_id,
        created_at,
        name,
        description,
        model,
        instructions,
        tools,
        metadata,
      } = assistant;

      await this.assistantRepo.create({
        assistant_id,
        user_id,
        createdAt: new Date(created_at * 1000),
        name,
        description,
        model,
        instructions,
        tools: JSON.stringify(tools),
        metadata: JSON.stringify(metadata),
      });

      await this.aiService.createVectorStore(user_id);

      await this.aiQueue.add('updated-user-knowledge-base-paths-job', {
        user_id,
      });
    } catch (e) {
      console.log(e);
    }
  }
}
