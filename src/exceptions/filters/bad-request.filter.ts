import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse: string | object = exception.getResponse();

    const message = this.getMessageFromExceptionResponse(exceptionResponse);

    response.status(status).json({
      success: false,
      data: null,
      error: {
        message,
        code: 4000,
      },
    });
  }

  private getMessageFromExceptionResponse(exceptionResponse: string | object) {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }
    return new ExceptionResponse(exceptionResponse).getMessageString();
  }
}

class ExceptionResponse {
  public message: string | string[] = 'Bad Request.';

  getMessageString(): string {
    if (typeof this.message === 'string') {
      return this.message;
    }
    return this.message?.length ? this.message[0] : 'Bad Request.';
  }

  constructor(data: any) {
    Object.assign(this, data);
  }
}
