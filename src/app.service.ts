import { Injectable } from '@nestjs/common';
import { SuccessResponseDTO } from './responses/resp.lib';

@Injectable()
export class AppService {
  constructor() {}

  async getHello() {
    return 'Hello World';
  }
}
