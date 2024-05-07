import axios from 'axios';
import { MercadoPagoPixRequest } from './interfaces/pix-request.interface';
import { MercadoPagoPixResponse } from './interfaces/pix-response.interface';

const MercadoPagoApi = axios.create({
  baseURL: 'https://api.mercadopago.com',
  headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
});

const createPixPayment = async (
  pixPaymentData: MercadoPagoPixRequest,
): Promise<MercadoPagoPixResponse> => {
  const { data } = await MercadoPagoApi.post(
    '/v1/payments',
    {
      transaction_amount: pixPaymentData.transaction_amount,
      payment_method_id: 'pix',
      payer: {
        email: pixPaymentData.email,
      },
      date_of_expiration: pixPaymentData.date_of_expiration,
      notification_url: `${process.env.MERCADOPAGO_WEBHOOK_URL}/payment/confirm-payment`,
    },
    {
      headers: { 'X-Idempotency-Key': pixPaymentData.internal_payment_id },
    },
  );
  return data as MercadoPagoPixResponse;
};

export { MercadoPagoApi, createPixPayment };
