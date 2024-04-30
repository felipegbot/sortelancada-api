import { FindOneUserService } from '@/modules/user/services/find-one-user.service';
import { User } from '@/modules/user/user.entity';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly findOneUserService: FindOneUserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const user: User = await this.findOneUserService.findOne({
      key: 'id',
      value: payload.id,
      relations: ['account'],
    });
    return user;
  }
}
