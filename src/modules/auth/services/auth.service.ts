import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/modules/user/user.entity';
import * as bcrypt from 'bcrypt';
import { FindOneUserService } from '@/modules/user/services/find-one-user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly findOneUserService: FindOneUserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Partial<User>> {
    const user = await this.findOneUserService.findOne({
      key: 'email',
      value: username,
      withPasswordHash: true,
    });
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }
    return null;
  }

  async getLoginResponse(user: User) {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      access_token: this.jwtService.sign(payload),
    };
  }
}
