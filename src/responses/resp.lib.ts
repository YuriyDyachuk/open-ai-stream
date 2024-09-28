import { IsOptional } from 'class-validator';

export class SuccessResponseDTO {
  @IsOptional()
  data: object;

  @IsOptional()
  error = null;

  @IsOptional()
  success = true;

  constructor(data: any = null) {
    Object.assign(this, { data });
  }
}
