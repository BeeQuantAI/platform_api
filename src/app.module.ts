import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
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
      autoSchemaFile: 'schema.gql',
    }),
    UserModule,
    AuthModule,
    ExchangeKeyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
