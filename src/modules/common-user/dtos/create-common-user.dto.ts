import { IsNotEmpty, IsString, Validate } from 'class-validator';
import isValidPhone from '@brazilian-utils/is-valid-phone';

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
  @Validate((o: CreateCommonUserDto) => {
    console.log(o);
    return isValidPhone(o.phone);
  })
  phone: string;
}
