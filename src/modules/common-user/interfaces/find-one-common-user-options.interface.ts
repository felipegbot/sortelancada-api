export interface FindOneCommonUserOptions {
  key: 'id' | 'phone';
  value: string;
  relations?: string[];
  withPasswordHash?: boolean;
}
