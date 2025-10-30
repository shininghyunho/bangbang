import { Controller, Get, Query, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginUserResponseDto } from './dto/login-user.response.dto';
import { ConfigService } from '@nestjs/config';

declare module 'express-session' {
  interface SessionData {
    userId: bigint;
  }
}
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('kakao/callback')
  async kakaoCallback(@Query('code') code: string, @Req() req: Request, @Res() res: Response) {
    const FRONTEND_BASE_URL = this.configService.getOrThrow<string>('FRONTEND_BASE_URL',"http://localhost:5173");

    try {
      const response: LoginUserResponseDto = await this.authService.kakaoLogin(code);

      if (req.session) {
        req.session.userId = response.userId;
        console.log(`User ${response.userId} login. Session ID: ${req.sessionID}`);
      } else {
        console.error('Session 이 존재하지 않음.');
        throw new Error('Session failed.');
      }

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
