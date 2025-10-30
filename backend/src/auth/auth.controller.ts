import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('kakao/callback')
  async kakaoCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      await this.authService.kakaoLogin(code);
      res.send('성공! 백엔드 콘솔에서 사용자 정보를 확인하세요.');
    } catch (error) {
      console.error(error);
      res.status(500).send('카카오 로그인 처리 중 오류가 발생했습니다.');
    }
  }
}
