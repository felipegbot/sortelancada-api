import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const config = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export default config;
