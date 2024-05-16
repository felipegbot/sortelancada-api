import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreateCommonUserDto } from '../dtos/create-common-user.dto';
import { CreateCommonUserService, FindOneCommonUserService } from '../services';

@Controller('common-user')
export class CommonUserController {
  constructor(
    private readonly findOneCommonUser: FindOneCommonUserService,
    private readonly createOneCommonUser: CreateCommonUserService,
  ) {}
  logger = new Logger(CommonUserController.name);

  @Post('create-or-return')
  async createUser(@Body() createCommonUserDto: CreateCommonUserDto) {
    const { phone } = createCommonUserDto;
    const formattedPhone = phone.replace(/\D/g, '');
    createCommonUserDto.phone = formattedPhone;
    const alreadyExists = await this.findOneCommonUser.findOne({
      where: [{ phone: formattedPhone }],
    });

    if (alreadyExists) return { ok: true, user: alreadyExists };

    const user = await this.createOneCommonUser.createUser(createCommonUserDto);
    return { ok: true, user };
  }
}
