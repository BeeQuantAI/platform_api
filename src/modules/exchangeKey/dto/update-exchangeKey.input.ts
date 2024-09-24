import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateExchangeKeyInput {
  @Field({ description: 'Exchange key id' })
  id: string;

  @Field({ description: 'Display name' })
  displayName: string;

  @Field({ description: 'Exchange name' })
  exchangeName: string;

  @Field({ description: 'Access key' })
  accessKey: string;

  @Field({ description: 'Secret key' })
  secretKey: string;
}
