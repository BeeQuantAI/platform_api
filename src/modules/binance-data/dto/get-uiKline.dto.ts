import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetUiKlineDto {
  @Field({ description: 'Symbol' })
  symbol: string;

  @Field({ description: 'Interval' })
  interval: string;

  @Field({ description: 'Start time', nullable: true })
  startTime?: string;

  @Field({ description: 'End time', nullable: true })
  endTime?: string;

  @Field({ description: 'Limit', nullable: true })
  limit?: number;

  @Field({ description: 'Time Zone', nullable: true })
  timeZone?: string;
}
