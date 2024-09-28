import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiValidationException extends HttpException {
  constructor(
    message = 'Oops. Something went wrong... Try again later.',
    http_status = HttpStatus.BAD_REQUEST,
    code = 400,
  ) {
    super(
      {
        success: false,
        data: null,
        error: {
          message,
          code,
        },
      },
      http_status,
    );
  }
}
