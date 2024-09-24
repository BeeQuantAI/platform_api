import { CommonType } from '@/common/dto/common.type';
import { createResult } from '@/common/dto/result.type';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ExchangeKey')
export class ExchangeKeyType extends CommonType {
  @Field({ description: 'Exchange key ID' })
  id: string;
  @Field({ description: 'Display name' })
  displayName: string;
  @Field({ description: 'Access key' })
  accessKey: string;
  @Field({ description: 'Secret key' })
  secretKey: string;
  @Field({ description: 'Remarks' })
  remarks?: string;
  @Field({ description: 'Exchange name' })
  exchangeName: string;
}

export const ResultForExchangeKey = createResult(ExchangeKeyType, 'ResultForExchangeKey');
