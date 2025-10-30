import { Injectable } from '@nestjs/common';
import { KakaoLoginService, KakaoUserInfo } from './kakao-login.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly kakaoLoginService: KakaoLoginService,
  ) {}

  async kakaoLogin(code: string): Promise<KakaoUserInfo> {
    const accessToken = await this.kakaoLoginService.getKakaoAccessToken(code);
    const kakaoUserInfo = await this.kakaoLoginService.getKakaoUserInfo(accessToken);

    // 받아온 사용자 정보(kakaoUserInfo)를 저장하고 JWT 토큰 발급
    return kakaoUserInfo;
  }
}