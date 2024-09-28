import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: Array<string | null>) =>
  SetMetadata('roles', roles);
