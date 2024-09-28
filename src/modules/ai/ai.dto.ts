import {
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class GeneratedAiTextDTO {
  @IsNumber()
  @IsOptional()
  person_id?: number | null;

  @IsNumber()
  @IsOptional()
  prompt_id?: number | null;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  type_event: string;
}
