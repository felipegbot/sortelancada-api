import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateCommonUserDto } from '../dtos/create-common-user.dto';
import { CreateCommonUserService, FindOneCommonUserService } from '../services';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PaginationDto } from '@/common/dtos/pagination.dto';
import ApiError from '@/common/error/entities/api-error.entity';

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

  @Get('/list')
  @UseGuards(JwtAuthGuard)
  async listUsers(@Query() options: PaginationDto) {
    const { commonUsers, count } = await this.findOneCommonUser.list({
      ...options,
      additionalSelects: ['created_at'],
    });
    return { ok: true, commonUsers, count };
  }

  @Post('/update-user-by-phone/:phone')
  @UseGuards(JwtAuthGuard)
  async updateUserByPhone(
    @Param('phone') phone: string,
    @Body() { name }: { name: string },
  ) {
    const formattedPhone = phone.replace(/\D/g, '');
    const user = await this.findOneCommonUser.findOne({
      where: [{ phone: formattedPhone }],
    });

    if (!user)
      throw new ApiError('user-not-found', 'Usuário não encontrado', 404);
    if (!name || name == '')
      throw new ApiError('name-required', 'Nome é obrigatório', 400);

    const updatedUser = await this.createOneCommonUser.updateUser(user.id, {
      name,
    });

    return { ok: true, user: updatedUser };
  }
}
