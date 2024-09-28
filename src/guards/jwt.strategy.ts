import { InjectModel } from '@nestjs/sequelize';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '../database/entities';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiValidationException } from '../exceptions/ApiValidationException';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User)
    private usersRepository: typeof User,
  ) {
    const secretOrKey = process.env.JWT_SECRET;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(userData: { email?: string; id: number; role: string }): Promise<User> {
    const { id, role } = userData;

    if (!id || !role) {
      throw new ApiValidationException('Incorrect token.', HttpStatus.FORBIDDEN);
    }

    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new ApiValidationException('User not found.', HttpStatus.FORBIDDEN);
    }

    return user;
  }
}
