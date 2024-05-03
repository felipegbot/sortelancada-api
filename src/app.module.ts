import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AdminUserModule } from './modules/admin-user/admin-user.module';
import { CommonUserModule } from './modules/common-user/common-user.module';
import { RaffleModule } from './modules/raffles/raffle.module';
import { PaymentModule } from './modules/payment/payment.module';
import { UsersRaffleNumberModule } from './modules/users-raffle-number/users-raffle-number.module';
config();

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: true,
    }),
    AuthModule,
    CommonUserModule,
    AdminUserModule,
    RaffleModule,
    PaymentModule,
    UsersRaffleNumberModule,
  ],
})
export class AppModule {}
