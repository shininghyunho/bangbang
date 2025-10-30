import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserResponseDto } from './dto/login-user.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('kakao/callback')
  async kakaoCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const response: LoginUserResponseDto = await this.authService.kakaoLogin(code);
      res.send(response);
    } catch (error) {
      console.error(error);
      res.status(500).send('카카오 로그인 처리 중 오류가 발생했습니다.');
    }
  }
}
