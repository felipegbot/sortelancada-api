import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreateCommonUserDto } from '../dtos/create-common-user.dto';

@Controller('user')
export class UserController {
  constructor() {}
  logger = new Logger(UserController.name);

  @Post('create')
  async createUser(@Body() createCommonUserDto: CreateCommonUserDto) {}
}
