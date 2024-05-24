import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateCommonUserDto {
  @IsNotEmpty({
    context: {
      message: `missing-name`,
      userMessage: `Nome obrigatório`,
    },
  })
  @IsString({
    context: {
      message: `invalid-name`,
      userMessage: `Nome inválido`,
    },
  })
  name: string;

  @IsNotEmpty({
    context: {
      message: `missing-phone`,
      userMessage: `Telefone obrigatório`,
    },
  })
  @IsString({
    context: {
      message: `invalid-phone`,
      userMessage: `Telefone inválido`,
    },
  })
  phone: string;
}
