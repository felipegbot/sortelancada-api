export type FindOneOptions<T> = {
  where: Array<{ [K in keyof Partial<T>]: T[keyof T] }>;
  relations?: string[];
  with_password_hash?: boolean;
};
