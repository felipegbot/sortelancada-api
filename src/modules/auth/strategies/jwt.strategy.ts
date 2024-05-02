import { AdminUser } from '@/modules/admin-user/admin-user.entity';
import { FindOneAdminUserService } from '@/modules/admin-user/services/find-one-admin-user.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly findOneAdminUserService: FindOneAdminUserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const { id } = payload;
    const user: AdminUser = await this.findOneAdminUserService.findOne({
      where: [{ id }],
    });
    return user;
  }
}
