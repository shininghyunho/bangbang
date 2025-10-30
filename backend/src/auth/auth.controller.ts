import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserResponseDto } from './dto/login-user.response.dto';
import { ConfigService } from '@nestjs/config';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('kakao/callback')
  async kakaoCallback(@Query('code') code: string, @Res() res: Response) {
    const FRONTEND_BASE_URL = this.configService.getOrThrow<string>('FRONTEND_BASE_URL',"http://localhost:5173");

    try {
      const response: LoginUserResponseDto = await this.authService.kakaoLogin(code);
      const redirectUrl = new URL(FRONTEND_BASE_URL);

      redirectUrl.searchParams.append('name', response.name);
      if (response.imgUrl) redirectUrl.searchParams.append('imgUrl', response.imgUrl);
      
      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error(error);
      const errorRedirectUrl = new URL(FRONTEND_BASE_URL);
      
      errorRedirectUrl.searchParams.append('error', 'kakao_login_failed');
      res.redirect(errorRedirectUrl.toString());
    }
  }
}
