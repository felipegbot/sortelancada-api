import axios from 'axios';
import { MercadoPagoPixRequest } from './interfaces/pix-request.interface';
import { MercadoPagoPixResponse } from './interfaces/pix-response.interface';
import moment from '../libs/moment';

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
      date_of_expiration: moment().add(30, 'minutes').toISOString(),
    },
    {
      headers: { 'X-Idempotency-Key': pixPaymentData.internal_payment_id },
    },
  );
  console.log(data);
  return data as MercadoPagoPixResponse;
};

export { MercadoPagoApi, createPixPayment };
