import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreateCommonUserDto } from '../dtos/create-common-user.dto';
import { CreateCommonUserService, FindOneCommonUserService } from '../services';
import { CommonUser } from '../common-user.entity';

@Controller('user')
export class CommonUserController {
  constructor(
    private readonly findOneCommonUser: FindOneCommonUserService,
    private readonly createOneCommonUser: CreateCommonUserService,
  ) {}
  logger = new Logger(CommonUserController.name);

  @Post('create-or-update')
  async createUser(@Body() createCommonUserDto: CreateCommonUserDto) {
    const alreadyExists = await this.findOneCommonUser.findOne({
      where: [{ phone: createCommonUserDto.phone }],
    });

    let user: CommonUser;

    user = alreadyExists
      ? await this.createOneCommonUser.updateUser(alreadyExists.id, {
          name: createCommonUserDto.name,
        })
      : await this.createOneCommonUser.createUser(createCommonUserDto);

    return { ok: true, user };
  }
}
