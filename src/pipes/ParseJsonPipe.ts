import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseJsonPipe
  implements PipeTransform<string, Record<string, any> | null>
{
  transform(value: string, metadata: ArgumentMetadata): Record<string, any> {
    const propertyName = metadata.data;
    try {
      console.log({ value });
      if (!value) return {};

      return JSON.parse(value);
    } catch (e) {
      throw new BadRequestException(`${propertyName} contains invalid JSON `);
    }
  }
}
