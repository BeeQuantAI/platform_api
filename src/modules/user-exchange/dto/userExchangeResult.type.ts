import { Field, ObjectType } from '@nestjs/graphql';
import { createResults } from '@/common/dto/result.type';

@ObjectType()
export class UserExchangeType {
  @Field({ description: 'Exchange ID' })
  id: string;

  @Field({ description: 'Exchange name' })
  name: string;

  @Field({ description: 'Display Name' })
  displayName: string;

  @Field({ description: 'Total balance in USD' })
  balances: number;
}

export const ResultForExchanges = createResults(UserExchangeType, 'ResultForExchanges');
