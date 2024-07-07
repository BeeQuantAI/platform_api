import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ExchangeKeyModule } from './modules/exchangeKey/exchangeKey.module';
import getConfig from './config';
import { AuthModule } from './modules/auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './global-exception.filter';
import * as cookieParser from 'cookie-parser';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: getConfig('DB_HOST'),
      port: parseInt(getConfig('DB_PORT'), 10),
      username: getConfig('DB_USERNAME'),
      password: getConfig('DB_PASSWORD'),
      database: getConfig('DB_NAME'),
      entities: [`${__dirname}/../modules/**/*.entity{.ts,.js}`],
      logging: true,
      synchronize: true,
      autoLoadEntities: true,
      subscribers: [],
      migrations: [],
    }),
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      context: ({ req, res }) => ({ req, res }), 
      autoSchemaFile: 'schema.gql',
      formatError: (error) => {
        const errorMessage = {
          message: error.message,
          path: error.path,
        };
        return errorMessage;
      },
    }),
    UserModule,
    AuthModule,
    ExchangeKeyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*'); 
  }
}
