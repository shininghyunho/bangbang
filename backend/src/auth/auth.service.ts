import { Injectable, NotFoundException } from '@nestjs/common';
import { KakaoLoginService, KakaoUserInfo } from './kakao-login.service';
import { ProviderRepository } from './repositories/provider.repository';
import { OauthAccountRepository } from './repositories/oauth_account.repository';
import { UserRepository } from '../users/repositories/user.repository';
import { User } from '../users/entities/user.entity';
import { OauthAccount } from './entities/oauth_account.entity';
import { Transactional } from 'typeorm-transactional';
import { LoginUserResponseDto } from './dto/login-user.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly kakaoLoginService: KakaoLoginService,
    private readonly providerRepository: ProviderRepository,
    private readonly oauthAccountRepository: OauthAccountRepository,
    private readonly userRepository: UserRepository,
  ) {}

  @Transactional()
  async kakaoLogin(code: string): Promise<LoginUserResponseDto> {
    const kakaoUserInfo = await this.getKakaoUserInfo(code);

    const provider = await this.providerRepository.findByName('kakao');
    if (!provider)
      throw new NotFoundException('kakao라는 Provider는 없습니다.');

    const providerUserId = kakaoUserInfo.id.toString();
    const oauthAccount = await this.oauthAccountRepository.findByProvider(
      provider.id,
      providerUserId,
    );

    let userName = '';
    let userId: bigint;
    if (oauthAccount) {
      const user = await this.userRepository.findById(oauthAccount.userId);
      if (!user) throw new NotFoundException('User NOT_FOUND');
      userName = user.name;
      userId = user.id;
    } else {
      const savedUser = await this.userRepository.save(
        this.getNewUser(kakaoUserInfo.properties.nickname),
      );
      await this.saveOauthAccount(provider.id, providerUserId, savedUser.id);
      userId = savedUser.id;
      userName = savedUser.name;
    }

    return {
      name: userName,
      imgUrl: kakaoUserInfo.kakao_account.profile.profile_image_url,
      userId: userId,
    };
  }

  private getNewUser(name: string): User {
    const newUser = new User();
    newUser.name = name;
    return newUser;
  }

  private async getKakaoUserInfo(code: string): Promise<KakaoUserInfo> {
    const kakaoToken = await this.kakaoLoginService.getKakaoToken(code);
    const accessToken = kakaoToken.access_token;
    return this.kakaoLoginService.getKakaoUserInfo(accessToken);
  }

  private async saveOauthAccount(
    providerId: number,
    providerUserId: string,
    userId: bigint,
  ) {
    const newOauthAccount = new OauthAccount();
    newOauthAccount.providerId = providerId;
    newOauthAccount.providerUserId = providerUserId;
    newOauthAccount.userId = userId;
    await this.oauthAccountRepository.save(newOauthAccount);
  }
}
