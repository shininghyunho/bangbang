import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AuthService } from '../../src/auth/auth.service';
import { KakaoLoginService } from '../../src/auth/kakao-login.service';
import { TestDbContainer } from '../test-db.container';
import { Provider } from '../../src/auth/entities/provider.entity';
import { User } from '../../src/users/entities/user.entity';
import { OauthAccount } from '../../src/auth/entities/oauth_account.entity';
import { UserRepository } from '../../src/users/repositories/user.repository';
import { ProviderRepository } from '../../src/auth/repositories/provider.repository';
import { OauthAccountRepository } from '../../src/auth/repositories/oauth_account.repository';
import { NotFoundException } from '@nestjs/common';
import { initializeTransactionalContext, addTransactionalDataSource } from 'typeorm-transactional';

initializeTransactionalContext();

describe('카카오 로그인 비즈니스 로직 통합 테스트', () => {
  let authService: AuthService;
  let kakaoLoginService: KakaoLoginService;
  let dataSource: DataSource;
  let testDb: TestDbContainer;

  // 가짜 카카오 유저 정보
  const mockKakaoUserInfo = {
    id: 123456789,
    properties: { nickname: '코딩왕' },
    kakao_account: {
      profile: { profile_image_url: 'http://image.com' }
    }
  };

  beforeAll(async () => {
    testDb = new TestDbContainer();
    dataSource = addTransactionalDataSource(await testDb.start());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useFactory: (ds: DataSource) => new UserRepository(ds.getRepository(User)),
          inject: [DataSource],
        },
        {
          provide: ProviderRepository,
          useFactory: (ds: DataSource) => new ProviderRepository(ds.getRepository(Provider)),
          inject: [DataSource],
        },
        {
          provide: OauthAccountRepository,
          useFactory: (ds: DataSource) => new OauthAccountRepository(ds.getRepository(OauthAccount)),
          inject: [DataSource],
        },
        {
          provide: KakaoLoginService,
          useValue: {
            getKakaoToken: jest.fn().mockResolvedValue({ access_token: 'fake_token' }),
            getKakaoUserInfo: jest.fn().mockResolvedValue(mockKakaoUserInfo),
          },
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    kakaoLoginService = module.get<KakaoLoginService>(KakaoLoginService);
  }, 60000);

  afterAll(async () => {
    await testDb.stop();
  });

  beforeEach(async () => {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('TRUNCATE TABLE oauth_accounts');
    await dataSource.query('TRUNCATE TABLE users');
    await dataSource.query('TRUNCATE TABLE providers');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  describe('GIVEN: 카카오 소셜 로그인 기능을 제공하는 시스템에서', () => {
    
    describe('GIVEN: 신규 유저가 처음으로 카카오 로그인을 시도하는 상황에서', () => {
      beforeEach(async () => {
        await dataSource.getRepository(Provider).save({ name: 'kakao' });
      });

      describe('WHEN: 카카오로부터 새로운 유저 정보가 전달된다면', () => {
        it('THEN: 시스템에 해당 닉네임("코딩왕")으로 신규 유저가 생성되어야 한다', async () => {
          const result = await authService.kakaoLogin('auth_code');
          
          const user = await dataSource.getRepository(User).findOneBy({ name: '코딩왕' });
          expect(user).toBeDefined();
          expect(result.name).toBe('코딩왕');
        });

        it('THEN: oauth_accounts 테이블에 카카오 ID가 유저와 연결되어 저장되어야 한다', async () => {
          await authService.kakaoLogin('auth_code');
          
          const oauthAccount = await dataSource.getRepository(OauthAccount).findOneBy({ 
            providerUserId: mockKakaoUserInfo.id.toString() 
          });
          expect(oauthAccount).toBeDefined();
        });
      });
    });

    describe('GIVEN: 이미 카카오 ID로 가입된 유저가 존재하는 상황에서', () => {
      let existingUser: User;

      beforeEach(async () => {
        const provider = await dataSource.getRepository(Provider).save({ name: 'kakao' });
        existingUser = await dataSource.getRepository(User).save({ 
          name: '기존유저', 
          email: 'old@test.com', 
          password: 'pass' 
        });
        await dataSource.getRepository(OauthAccount).save({
          userId: existingUser.id,
          providerId: provider.id,
          providerUserId: mockKakaoUserInfo.id.toString(),
        });
      });

      describe('WHEN: 동일한 카카오 계정으로 로그인을 시도한다면', () => {
        it('THEN: 새로운 유저가 추가로 생성되지 않아야 한다', async () => {
          await authService.kakaoLogin('auth_code');
          
          const userCount = await dataSource.getRepository(User).count();
          expect(userCount).toBe(1);
        });

        it('THEN: 기존에 가입된 유저 정보가 반환되어야 한다', async () => {
          const result = await authService.kakaoLogin('auth_code');
          expect(result.userId.toString()).toBe(existingUser.id.toString());
          expect(result.name).toBe('기존유저');
        });
      });
    });

    describe('GIVEN: 시스템에 카카오 제공자(Provider) 설정이 누락된 상황에서', () => {
      describe('WHEN: 사용자가 카카오 로그인을 시도한다면', () => {
        it('THEN: "kakao라는 Provider는 없습니다." 에러가 발생해야 한다', async () => {
          await expect(authService.kakaoLogin('auth_code'))
            .rejects
            .toThrow(new NotFoundException('kakao라는 Provider는 없습니다.'));
        });
      });
    });
  });
});
