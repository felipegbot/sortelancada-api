import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GeneratePaymentDto } from '../dtos/generate-payment.dto';
import { FindOneCommonUserService } from '@/modules/common-user/services';
import { CreatePaymentService } from '../services/create-payment.service';
import ApiError from '@/common/error/entities/api-error.entity';
import {
  CreateRaffleService,
  QueryRaffleService,
} from '@/modules/raffles/services';
import { CreateUsersRaffleNumberService } from '@/modules/users-raffle-number/services/create-users-raffle-number.service';
import { QueryPaymentService } from '../services/find-one-payment.service';
import { PaymentStatus } from '../enums/payment-status.enum';
import * as AsyncLock from 'async-lock';
import { ValidateWebhookService } from '../services/validate-payment-webhook.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RaffleStatus } from '@/modules/raffles/enum/raffle-status.enum';
import { PaginationDto } from '@/common/dtos/pagination.dto';

@Controller('payment')
export class PaymentController {
  private lock: AsyncLock;
  private logger: Logger;
  constructor(
    private readonly findOneCommonUserService: FindOneCommonUserService,
    private readonly createPaymentService: CreatePaymentService,
    private readonly createRaffleService: CreateRaffleService,
    private readonly queryPaymentService: QueryPaymentService,
    private readonly validateWebhookService: ValidateWebhookService,
    private readonly queryRaffleService: QueryRaffleService,
    private readonly createUsersRaffleNumberService: CreateUsersRaffleNumberService,
  ) {
    this.lock = new AsyncLock();
    this.logger = new Logger(PaymentController.name);
  }

  @Get(`/list`)
  @UseGuards(JwtAuthGuard)
  async getPayments(@Query() query: PaginationDto) {
    const { payments, count } = await this.queryPaymentService.list({
      ...query,
      relations: ['commonUser'],
    });
    return { ok: true, payments, count };
  }

  @Get('payments-by-user-phone/:userPhone')
  async getPaymentsByUserPhone(@Param('userPhone') userPhone: string) {
    const formattedUserPhone = userPhone.replace(/\D/g, '');
    const commonUser = await this.findOneCommonUserService.findOne({
      where: [{ phone: formattedUserPhone }],
      relations: ['payments'],
      with_users_raffle_number: true,
    });
    if (!commonUser)
      throw new ApiError(
        'common-user-not-found',
        'Usuário não encontrado para este telefone',
        404,
      );

    return { ok: true, payments: commonUser.payments };
  }

  @Get('find-one/:paymentId')
  async findOnePayment(@Param('paymentId') paymentId: string) {
    const payment = await this.queryPaymentService.findOne({
      where: [{ id: paymentId }],
      relations: ['users_raffle_number'],
    });
    if (!payment)
      throw new ApiError('payment-not-found', 'Pagamento não encontrado', 400);
    return { ok: true, payment };
  }

  @Post('/generate-payment')
  async generatePayment(@Body() generatePaymentDto: GeneratePaymentDto) {
    const { phone } = generatePaymentDto;
    const formattedPhone = phone.replace(/\D/g, '');
    generatePaymentDto.phone = formattedPhone;
    const commonUser = await this.findOneCommonUserService.findOne({
      where: [{ phone: formattedPhone }],
    });
    if (!commonUser)
      throw new ApiError(
        'common-user-not-found',
        'Usuário não encontrado com esse telefone',
        404,
      );

    const raffle = await this.queryRaffleService.findOneRaffle({
      where: [{ id: generatePaymentDto.raffle_id, status: RaffleStatus.OPEN }],
    });

    if (!raffle)
      throw new ApiError(
        'raffle-not-found',
        'Rifa não encontrada ou já foi finalizada',
        404,
      );
    if (raffle.available_numbers_qtd < generatePaymentDto.amount) {
      throw new ApiError(
        'invalid-amount',
        'Quantidade de números indisponível',
        400,
      );
    }

    if (generatePaymentDto.amount < raffle.min_quantity) {
      throw new ApiError(
        'invalid-amount',
        'Quantidade de números abaixo do mínimo',
        400,
      );
    }

    const payment = await this.createPaymentService.createPayment(
      generatePaymentDto,
      commonUser,
    );

    await this.createRaffleService.updateRaffle(raffle.id, {
      available_numbers_qtd:
        raffle.available_numbers_qtd - generatePaymentDto.amount,
    });
    delete payment.mercadopago_id;
    return { ok: true, payment };
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    this.logger.log('Running cron job');
    const unvalidatedPayments =
      await this.queryPaymentService.getUnvalidatedPayments();

    const ids = Array.from(
      new Set(unvalidatedPayments.map((payment) => payment.raffle_id)),
    );
    const { raffles } = await this.queryRaffleService.queryRaffle({
      ids,
      additionalSelects: ['id', 'status', 'available_numbers_qtd'],
    });
    let rafflesWithItsAvailableNumbers = raffles.map((raffle) => {
      return {
        id: raffle.id,
        status: raffle.status,
        available_numbers_qtd: raffle.available_numbers_qtd,
      };
    });

    unvalidatedPayments.forEach((payment) => {
      rafflesWithItsAvailableNumbers.find((r) => r.id == payment.raffle_id)
        .status === RaffleStatus.OPEN
        ? (rafflesWithItsAvailableNumbers.find(
            (r) => r.id == payment.raffle_id,
          ).available_numbers_qtd += payment.raffles_quantity)
        : null;
    });

    for (const raffle of rafflesWithItsAvailableNumbers) {
      await this.createRaffleService.updateRaffle(raffle.id, {
        available_numbers_qtd: raffle.available_numbers_qtd,
      });
    }
    await this.createPaymentService.removePayments(unvalidatedPayments);
    this.logger.log(
      'Finished cron job',
      `Removed ${unvalidatedPayments.length} payments`,
    );
  }

  @Post('/confirm-payment')
  async confirmPayment(
    @Headers()
    {
      'x-signature': authToken,
      'x-request-id': requestId,
    }: { 'x-signature': string; 'x-request-id': string },
    @Body() { action }: { action: string },
    @Query()
    { 'data.id': mercadopago_id, type }: { 'data.id': string; type: string },
  ) {
    if (type !== 'payment' || action.split('.')[1] !== 'updated')
      return { ok: true };

    const isValid = await this.validateWebhookService.validateWebhook(
      authToken,
      mercadopago_id,
      requestId,
    );

    if (!isValid)
      throw new ApiError('invalid-signature', 'Assinatura inválida', 400);

    const payment = await this.queryPaymentService.findOne({
      where: [{ mercadopago_id }],
      additionalSelects: ['mercadopago_id'],
    });

    if (!payment || payment.status !== PaymentStatus.PENDING)
      return { ok: true };

    await this.lock.acquire('generateRaffleNumber', async () => {
      const { count } =
        await this.createUsersRaffleNumberService.generateRaffleNumber(
          payment.raffle_id,
          payment.raffles_quantity,
          payment.id,
          payment.common_user_id,
        );

      await this.createPaymentService.updatePaymentStatus(
        payment.id,
        PaymentStatus.SUCCESS,
      );

      this.logger.log(
        `Generated ${count} raffle numbers for payment ${payment.id}`,
      );
    });
    return { ok: true };
  }

  @Post('force-confirm-payment/:paymentId')
  @UseGuards(JwtAuthGuard)
  async forceConfirmPayment(@Param('paymentId') paymentId: string) {
    const payment = await this.queryPaymentService.findOne({
      where: [{ id: paymentId }],
    });
    if (!payment)
      throw new ApiError('payment-not-found', 'Pagamento não encontrado', 400);

    if (payment.status !== PaymentStatus.PENDING)
      throw new ApiError(
        'payment-not-pending',
        'Pagamento não está pendente',
        400,
      );

    await this.lock.acquire('generateRaffleNumber', async () => {
      const { count } =
        await this.createUsersRaffleNumberService.generateRaffleNumber(
          payment.raffle_id,
          payment.raffles_quantity,
          payment.id,
          payment.common_user_id,
        );
      await this.createPaymentService.updatePaymentStatus(
        payment.id,
        PaymentStatus.SUCCESS,
      );
      this.logger.log(
        `Generated ${count} raffle numbers for payment ${payment.id}`,
      );
    });
    return { ok: true };
  }
}
