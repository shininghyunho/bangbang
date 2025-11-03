import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
  async kakaoCallback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const FRONTEND_BASE_URL = this.configService.getOrThrow<string>(
      'FRONTEND_BASE_URL',
      'http://localhost:5173',
    );

    try {
      const response: LoginUserResponseDto =
        await this.authService.kakaoLogin(code);

      if (req.session) {
        req.session.userId = response.userId;
        console.log(
          `User ${response.userId} login. Session ID: ${req.sessionID}`,
        );
      } else {
        console.error('Session 이 존재하지 않음.');
        throw new Error('Session failed.');
      }

      const redirectUrl = new URL(FRONTEND_BASE_URL);
      redirectUrl.searchParams.append('name', response.name);
      if (response.imgUrl)
        redirectUrl.searchParams.append('imgUrl', response.imgUrl);
      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error(error);
      const errorRedirectUrl = new URL(FRONTEND_BASE_URL);

      errorRedirectUrl.searchParams.append('error', 'kakao_login_failed');
      res.redirect(errorRedirectUrl.toString());
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          console.error('세션 제거 중 오류 발생:', err);
          return reject(new Error('로그아웃에 실패했습니다.'));
        }
        res.clearCookie('connect.sid');
        console.log('로그아웃 성공. 세션이 제거되었습니다.');
        resolve({ message: '로그아웃 되었습니다.' });
      });
    });
  }
}
