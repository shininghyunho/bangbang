import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { KakaoLoginService } from './kakao-login.service';
import { OauthAccount } from './entities/oauth_account.entity';
import { Provider } from './entities/provider.entity';
import { User } from '../users/entities/user.entity';
import { ProviderRepository } from './repositories/provider.repository';
import { OauthAccountRepository } from './repositories/oauth_account.repository';
import { UserRepository } from '../users/repositories/user.repository';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([OauthAccount, Provider, User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    KakaoLoginService,
    ProviderRepository,
    OauthAccountRepository,
    UserRepository,
  ],
})
export class AuthModule {}
