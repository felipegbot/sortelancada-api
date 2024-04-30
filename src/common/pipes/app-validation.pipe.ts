import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (rawErrors) => {
        console.dir(rawErrors, { depth: null });
        const contexts = rawErrors.map((error) => {
          if (error.constraints?.whitelistValidation !== undefined) {
            return [
              {
                message: 'forbidden-field',
                userMessage: `Sua requisição tem um ou mais campos não permitidos (${error.property})`,
              },
            ];
          }

          if (error.constraints?.isEnum) {
            return [
              {
                message: `invalid-${error.property}`,
                userMessage: `Valor do campo ${error.property} inválido`,
              },
            ];
          }

          if (error.children.length > 0)
            return this.getContexts(error.children);
          return Object.values(error.contexts);
        });
        const errors = contexts.reduce((acc, cur) => acc.concat(...cur), []);
        return new BadRequestException({ ok: false, errors });
      },
    });
  }

  getContexts(errors: ValidationError[]) {
    return errors.map((error) => {
      if (error.constraints?.whitelistValidation !== undefined) {
        return [
          {
            message: 'forbidden-field',
            userMessage: `Sua requisição tem um ou mais campos não permitidos (${error.property})`,
          },
        ];
      }
      if (error.constraints?.isEnum) {
        return [
          {
            message: `invalid-${error.property}`,
            userMessage: `Valor do campo ${error.property} inválido`,
          },
        ];
      }
      if (error.children.length > 0) return this.getContexts(error.children);
      return Object.values(error.contexts);
    });
  }
}
