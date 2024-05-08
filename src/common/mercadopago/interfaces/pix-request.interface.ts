export interface MercadoPagoPixRequest {
  payment_id: string;
  user_id: string;
  user_phone: string;
  users_raffle_amount: number;
  internal_payment_id: string;
  transaction_amount: number;
  date_of_expiration: string;
}
