import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('kakao/callback')
  async kakaoCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      // 1. 인가 코드로 액세스 토큰 요청
      const accessToken = await this.authService.getKakaoAccessToken(code);
      console.log('카카오 액세스 토큰:', accessToken);

      // 2. 액세스 토큰으로 사용자 정보 요청하기
      const userInfo = await this.authService.getKakaoUserInfo(accessToken);
      console.log('카카오 사용자 정보:', userInfo);

      // TODO: 3. DB에서 사용자 조회 또는 생성 후 우리 서비스의 JWT 발급
      res.send('성공! 백엔드 콘솔에서 사용자 정보를 확인하세요.');
    } catch (error) {
      console.error(error);
      res.status(500).send('카카오 로그인 처리 중 오류가 발생했습니다.');
    }
  }
}
