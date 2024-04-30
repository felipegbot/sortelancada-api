import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppValidationPipe } from './common/pipes/app-validation.pipe';
import { ApiErrorFilter } from './common/pipes/filter-error.pipe';
import { config } from 'dotenv';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalFilters(new ApiErrorFilter());
  console.log('App listening in ' + process.env.PORT);
  await app.listen(process.env.PORT ?? 1337);
}
bootstrap();
