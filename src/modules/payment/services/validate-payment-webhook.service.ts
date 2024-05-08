import ApiError from '@/common/error/entities/api-error.entity';
import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import * as tsse from 'tsse';

@Injectable()
export class ValidateWebhookService {
  async validateWebhook(
    headerToken: string,
    queryDataId: string,
    headerRequestId: string,
  ): Promise<boolean> {
    const ourToken = process.env.WEBHOOK_SECRET;

    const initialSplit = headerToken.split(',v1=');

    const token = initialSplit[1];
    const timestamp = initialSplit[0].replace('ts=', '');

    const template = `id:${queryDataId};request-id:${headerRequestId};ts:${timestamp};`;

    const hash = createHmac('sha256', ourToken).update(template).digest('hex');

    const isSignatureValid = await tsse(hash, token);

    if (!isSignatureValid)
      throw new ApiError('invalid-signature', 'Assinatura inválida', 400);

    return isSignatureValid;
  }
}
