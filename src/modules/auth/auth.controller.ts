import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { FacebookAuthGuard } from '@/common/guards/auth.guard.facebook';
import { GoogleAuthGuard } from '@/common/guards/auth.guard.google';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  facebookLogin() {}

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookCallback(@Req() req, @Res() res: Response) {
    const result = await this.authService.loginWithThirdParty(req.user);
    const token = result.data;
    res.redirect(`${process.env.OAUTH_REDIRECT_URI}?token=${token}`);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.loginWithThirdParty(req.user);
    const token = result.data;
    res.redirect(`${process.env.OAUTH_REDIRECT_URI}?token=${token}`);
  }
}
