import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Assistant as AssistantModel,
  User,
  UserAiRequest,
} from '../../database/entities';
import { SuccessResponseDTO } from '../../responses/resp.lib';
import { ApiValidationException } from '../../exceptions/ApiValidationException';
import {
  GeneratedAiTextDTO,
} from './ai.dto';

import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import OpenAI, { OpenAIError } from 'openai';
import { Readable } from 'stream';
import { toFile } from 'openai/uploads';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(AssistantModel)
    private readonly assistantRepo: typeof AssistantModel,
    @InjectModel(UserAiRequest)
    private readonly aiRequestRepo: typeof UserAiRequest,
    @InjectQueue('ai-queue')
    private readonly aiQueue: Queue,
  ) {

    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('openai.apiKey'),
    });
  }

  async makeAssistantForCustomer(
    user_id: number,
  ): Promise<OpenAI.Beta.Assistant | null> {
    try {
      const ENV_NAME = this.configService.get<string>('ENV_NAME') || '';

      return this.openai.beta.assistants.create({
        model: 'gpt-4o',
        name: `Assistant for User ${ENV_NAME} ${user_id}`,
        description: `Assistant for User ${ENV_NAME} ${user_id}`,
        instructions:
          "You are an artificial intelligence assistant tailored to the lawyer's experience in [Legal Law]: Lawyer Information and Legal Advice Assistance. Provide detailed and accurate information ONLY based on the resources provided.  If there is no context in the resources, provide an empty response.",
        tools: [{ type: 'file_search' }, { type: 'code_interpreter' }],
        metadata: {
          ENV_NAME,
          user_id: String(user_id),
        },
      });
    } catch (error) {
      console.error('Error creating assistant:', error);
      throw new ApiValidationException(this.__t('errors.error_ai_assistant'));
    }
  }

  async createVectorStore(user_id: number): Promise<void> {
    console.log('started');
    const assistant = await this.assistantRepo.findOne({
      where: {
        user_id,
      },
    });

    if (!assistant?.vector_store_id) {
      console.log('started vector');
      const { id: vector_store_id } =
        await this.openai.beta.vectorStores.create({});
      await this.assistantRepo.update(
        {
          vector_store_id,
        },
        {
          where: {
            user_id,
          },
        },
      );
    }
  }

  async getUserAssistant(user_id: number): Promise<OpenAI.Beta.Assistant> {
    const model = await this.assistantRepo.findOne({
      where: { user_id },
    });
    if (!model) {
      throw new ApiValidationException(this.__t('errors.assistant_not_found'));
    }
    const assistant = await this.openai.beta.assistants.retrieve(
      model.assistant_id,
    );
    if (!assistant) {
      throw new ApiValidationException(this.__t('errors.assistant_not_found'));
    }
    return assistant;
  }

  async uploadFileToOpenAi({ url }: { url: string }) {
    const name = url.split('/').pop();
    const convertedFile = await toFile(Readable.from(url), name);

    const response = await this.openai.files.create({
      file: convertedFile,
      purpose: 'assistants',
    });

    return response;
  }

  async generatedAiText(
    data: GeneratedAiTextDTO,
    user: User,
  ): Promise<SuccessResponseDTO> {
    const { text, person_id = null, prompt_id = null, type_event } = data;
    const { id: user_id } = user;

    await this.aiQueue.add('process-message-ai-thread-job', {
      text,
      person_id,
      prompt_id,
      user_id,
      type_event,
    });

    return new SuccessResponseDTO({ lists: [] });
  }

  async runAssistantJob(
    data: {
      text: string;
      person_id?: number;
      prompt_id?: number;
      user_id: number;
    },
    user_ai_request: UserAiRequest,
    sendIntermediateResult: (data: string) => void,
  ): Promise<string> {
    const { text, person_id = null, prompt_id = null, user_id } = data;
    const assistant = await this.assistantRepo.findOne({
      where: { user_id },
    });

    if (!assistant) {
      throw new ApiValidationException('Assistant not found');
    }

    const { assistant_id, instructions: baseInstruction } = assistant;

    const person = await this.getUserPersonById(user_id, person_id);
    const thread_id = person.thread_id;
    let instructions = `${baseInstruction}:`;

    user_ai_request.user_id = user_id;
    user_ai_request.persona_id = person_id;
    user_ai_request.ai_thread_id = thread_id;
    user_ai_request.selected_prompt = person.prompt;
    await user_ai_request.save();

    await this.openai.beta.threads.messages.create(thread_id, {
      role: 'user',
      content: text,
    });

    const _assistant = await this.getUserAssistant(assistant.user_id);

    const codeInterpreterResources = _assistant.tool_resources?.file_search;
    if (
      !codeInterpreterResources ||
      !codeInterpreterResources.vector_store_ids
    ) {
      console.error('No files loaded in vector_store_ids');
      return;
    }

    const fileIdsString = codeInterpreterResources.vector_store_ids
      .map((file: any) => file)
      .join(', ');

    instructions =
      instructions +
      `[ Use files with identifiers for more accurate analysis: ${fileIdsString}.]`;


    const stream = await this.openai.beta.threads.runs.stream(thread_id, {
      assistant_id,
      instructions,
      truncation_strategy: { type: 'last_messages', last_messages: 3 },
      tools: [
        {
          type: 'file_search',
        },
      ],
      model: 'gpt-4o',
    });

    let finalResponse = '';

    return new Promise((resolve, reject) => {
      stream
        .on('textDelta', (textDelta, snapshot) => {
          const content = textDelta.value || '';
          if (content) {
            finalResponse += content;
            sendIntermediateResult(content);
          }
        })
        .on('end', () => {
          // @ts-ignore
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });

      stream.on(
        'event',
        (event: OpenAI.Beta.Assistants.AssistantStreamEvent) => {
          if (event.data) {
            console.log(
              'OpenAI.Beta.Assistants.AssistantStreamEvent:',
              event.data,
            );
          }
        },
      );
    });
  }
}
