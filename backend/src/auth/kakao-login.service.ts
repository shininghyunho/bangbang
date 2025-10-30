import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface KakaoUserInfo {
  id: number;
  connected_at: string;
  properties: {
    nickname: string;
    profile_image: string;
    thumbnail_image: string;
  };
  kakao_account: {
    profile_nickname_needs_agreement: boolean;
    profile_image_needs_agreement: boolean;
    profile: {
      nickname: string;
      thumbnail_image_url: string;
      profile_image_url: string;
      is_default_image: boolean;
    };
  };
}

export interface KakaoTokenResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
}

@Injectable()
export class KakaoLoginService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getKakaoToken(code: string): Promise<KakaoTokenResponse> {
    const KAKAO_REST_API_KEY = this.configService.getOrThrow<string>('KAKAO_REST_API_KEY');
    const KAKAO_CLIENT_SECRET = this.configService.getOrThrow<string>('KAKAO_CLIENT_SECRET');
    const KAKAO_REDIRECT_URI = this.configService.getOrThrow<string>('KAKAO_REDIRECT_URI');

    const tokenUrl = 'https://kauth.kakao.com/oauth/token';
    const body = {
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: KAKAO_REDIRECT_URI,
      code: code,
      client_secret: KAKAO_CLIENT_SECRET,
    };

    const response = await firstValueFrom(
      this.httpService.post<KakaoTokenResponse>(tokenUrl, new URLSearchParams(body).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      }),
    );
    return response.data;
  }

  async getKakaoUserInfo(accessToken: string): Promise<KakaoUserInfo> {
    const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';

    const response = await firstValueFrom(
      this.httpService.get(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );
    return response.data;
  }
}