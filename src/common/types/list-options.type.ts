export type ListOptions<T> = {
  where?: Array<{ [K in keyof Partial<T>]: T[keyof T] }>;
  relations?: string[];
  page?: number;
  per_page?: number;
  name?: string;
  ids?: string[];
};
