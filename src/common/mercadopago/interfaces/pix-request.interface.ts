export interface MercadoPagoPixRequest {
  internal_payment_id: string;
  transaction_amount: number;
  email: string;
  date_of_expiration: string;
}
