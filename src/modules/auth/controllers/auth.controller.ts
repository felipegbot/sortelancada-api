import { User } from '@/modules/user/user.entity';
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('authenticate')
  @UseGuards(AuthGuard('local'))
  async authenticate(@Req() req: Request) {
    const user = req.user as User;
    return this.authService.getLoginResponse(user);
  }

  @Post('verify-jwt')
  @UseGuards(JwtAuthGuard)
  async verifyGuard(@Req() req: Request) {
    return { ok: true, user: req.user };
  }
}
