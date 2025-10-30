import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { KakaoLoginService } from './kakao-login.service';
import { OauthAccount } from './entities/oauth_account.entity';
import { Provider } from './entities/provider.entity';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([OauthAccount, Provider]),
  ],
  controllers: [AuthController],
  providers: [AuthService, KakaoLoginService],
})
export class AuthModule {}
