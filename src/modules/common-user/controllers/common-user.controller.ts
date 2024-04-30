import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreateCommonUserDto } from '../dtos/create-common-user.dto';

@Controller('user')
export class CommonUserController {
  constructor() {}
  logger = new Logger(CommonUserController.name);

  @Post('create')
  async createUser(@Body() createCommonUserDto: CreateCommonUserDto) {}
}
