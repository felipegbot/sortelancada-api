export interface FindOneAdminUserOptions {
  key: 'id' | 'email';
  value: string;
  relations?: string[];
  withPasswordHash?: boolean;
}
