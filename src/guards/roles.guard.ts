import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiValidationException } from '../exceptions/ApiValidationException';

@Injectable()
export class RolesGuard extends JwtAuthGuard {
  constructor(
    private reflector: Reflector,
  ) {
    super();
  }

  handleRequest(err, user, info, context, status) {
    if (err) {
      throw err;
    }
    if (!user) {
      const { name, message } = info || {};
      throw new ApiValidationException(
        message  ||
          name ||
          'Authorisation error.',
        name === 'TokenExpiredError'
          ? HttpStatus.UNAUTHORIZED
          : HttpStatus.FORBIDDEN,
      );
    }
    const [, token] = (
      context.switchToHttp().getRequest().headers.authorization || ''
    ).split(' ');
    if (!token) {
      throw new ApiValidationException(
        'Authorisation error.',
        HttpStatus.FORBIDDEN,
      );
    }
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      throw new ApiValidationException('incorrect_token', HttpStatus.FORBIDDEN);
    }

    const roles = this.reflector.get<Array<string | null>>(
      'roles',
      context.getHandler(),
    );

    if (roles?.length) {
      this.matchRoles(roles, user?.role || null);
    }

    return user;
  }

  matchRoles(roles: Array<string | null>, user_role?: string): boolean {
    if (!user_role) {
      return roles.includes(user_role);
    }
    const rolesArray = user_role
      .split(',')
      .map((r) => r.trim())
      .filter((r) => !!r);

    for (const role of rolesArray) {
      if (roles.includes(role)) {
        return true;
      }
    }

    throw new ApiValidationException('Your role in not allowed this route.');
  }
}
