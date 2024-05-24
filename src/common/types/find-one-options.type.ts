export type FindOneOptions<T> = {
  where: Array<{ [K in keyof Partial<T>]: T[keyof T] }>;
  relations?: string[];
  with_password_hash?: boolean;
  additionalSelects?: string[];
  with_users_raffle_number?: boolean;
  raffle_with_gift_winners?: boolean;
};
