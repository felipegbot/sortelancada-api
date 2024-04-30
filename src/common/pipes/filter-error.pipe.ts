import ApiError from '@/common/error/entities/api-error.entity';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';

@Catch(Error)
export class ApiErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    // Handling ApiError
    if (exception instanceof ApiError) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      if (exception.userMessage) {
        return response.status(exception.statusCode ?? 500).send({
          ok: false,
          error: {
            message: exception.message,
            userMessage: exception.userMessage,
          },
        });
      } else if (exception.message) {
        return response.status(exception.statusCode ?? 500).send({
          ok: false,
          error: {
            message: exception.message,
            userMessage: 'Erro desconhecido, entre em contato com o suporte.',
          },
        });
      } else {
        return response.status(exception.statusCode ?? 500).send({
          ok: false,
          error: { message: 'unknown-error', userMessage: 'Erro desconhecido' },
        });
      }
    }

    // Handling BadRequestException
    if (exception instanceof BadRequestException) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse['ok'] !== 'boolean') {
        return response.status(400).send({
          ok: false,
          errors: [
            {
              message: exceptionResponse['message'] ?? 'unknown-error',
              userMessage:
                'Houve um problema com a sua requisição, entre em contato com o suporte',
            },
          ],
        });
      } else {
        return response.status(400).send(exceptionResponse);
      }
    }

    if (exception instanceof NotFoundException) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      return response.status(404).send({
        ok: false,
        errors: [
          {
            message: exception.message,
            userMessage: 'Rota não encontrada',
          },
        ],
      });
    }

    //Handling other errors
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    return response.status(500).send({
      ok: false,
      errors: [
        {
          message: exception.message,
          userMessage: 'Erro desconhecido, entre em contato com o suporte.',
        },
      ],
    });
  }
}
