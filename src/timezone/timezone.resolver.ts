import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { TimezoneService } from './timezone.service';
import { UpdateTimezoneResponse } from './dto/update-timezone-response.dto';
import { GqlAuthGuard } from '../common/guards/auth.guard';

@Resolver()
export class TimezoneResolver {
  constructor(private readonly timezoneService: TimezoneService) {}

  @Query(() => [String], {
    description: 'Get a list of all available timezones',
  })
  getTimezones(): string[] {
    return this.timezoneService.getAllTimezones().map(tz => tz.displayName);
  }

  @Query(() => [String], {
    description: 'Get a list of major timezones',
  })
  getMajorTimezones(): string[] {
    return this.timezoneService.getMajorTimezones().map(tz => tz.displayName);
  }

  @Mutation(() => UpdateTimezoneResponse)
  @UseGuards(GqlAuthGuard)
  async updateTimezone(
    @Args('userId') userId: string,
    @Args('timezone') timezone: string,
    @Context() context: any
  ): Promise<UpdateTimezoneResponse> {
    const req = context.req;
    const user = req.user;

    if (user.id !== userId) {
      throw new UnauthorizedException('User authentication failed');
    }

    return this.timezoneService.updateUserTimezone(userId, timezone);
  }
}
