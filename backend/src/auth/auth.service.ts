import { Injectable } from '@nestjs/common';
import { KakaoLoginService, KakaoUserInfo } from './kakao-login.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly kakaoLoginService: KakaoLoginService,
  ) {}

  async kakaoLogin(code: string) {
    const kakaoToken = await this.kakaoLoginService.getKakaoToken(code);
    console.log('kakaoToken:', kakaoToken);
    const accessToken = kakaoToken.access_token;
    const kakaoUserInfo = await this.kakaoLoginService.getKakaoUserInfo(accessToken);
    console.log('kakaoUserInfo:', kakaoUserInfo);

    // 받아온 사용자 정보(kakaoUserInfo)를 저장하고 JWT 토큰 발급
  }
}