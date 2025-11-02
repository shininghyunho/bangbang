import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { ListingRepository } from '../../src/listings/repositories/listing.repository';
import { Listing } from '../../src/listings/entities/listing.entity';
import { ListingSchedule } from '../../src/listings/entities/listing-schedule.entity';
import { User } from '../../src/users/entities/user.entity';
import { OauthAccount } from '../../src/auth/entities/oauth_account.entity';
import { Provider } from '../../src/auth/entities/provider.entity';
import { SearchListingsRequestDto } from '../../src/listings/dto/search-listings.request.dto';
import * as mysql2 from 'mysql2';

describe('ListingRepository (통합 테스트)', () => {
  let app: INestApplication;
  let listingRepository: ListingRepository;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let listingEntityRepository: Repository<Listing>;
  let listingScheduleRepository: Repository<ListingSchedule>;

  let testUser: User;
  let testListing: Listing;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            driver: mysql2,
            connectorPackage: 'mysql2',
            host: configService.getOrThrow<string>('DATABASE_HOST'),
            port: configService.getOrThrow<number>('DATABASE_PORT'),
            username: configService.getOrThrow<string>('DATABASE_USER'),
            password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
            database: configService.getOrThrow<string>('DATABASE_NAME'),
            entities: [Listing, ListingSchedule, User, OauthAccount, Provider],
            synchronize: true,
            dropSchema: true,
            logging: false,
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Listing, ListingSchedule, User, OauthAccount, Provider]),
      ],
      providers: [ListingRepository],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    listingRepository = moduleFixture.get<ListingRepository>(ListingRepository);
    userRepository = dataSource.getRepository(User);
    listingEntityRepository = dataSource.getRepository(Listing);
    listingScheduleRepository = dataSource.getRepository(ListingSchedule);

    // 유저
    testUser = await userRepository.save({
      email: 'test@example.com',
      password: 'password',
      name: '테스트 사용자',
    });

    // 숙소
    testListing = await listingEntityRepository.save({
      hostId: testUser.id,
      name: '테스트 숙소',
      description: '아름다운 장소',
      guestCapacity: 4,
      infantCapacity: 1,
      address: '123 테스트 거리',
    });

    // 숙소 스케쥴
    await listingScheduleRepository.save([
      {
        listingId: testListing.id,
        date: '2023-01-01',
        price: 150.0,
        isAvailable: true,
      },
      {
        listingId: testListing.id,
        date: '2023-01-02',
        price: 150.0,
        isAvailable: true,
      },
      {
        listingId: testListing.id,
        date: '2023-01-03',
        price: 150.0,
        isAvailable: true,
      },
      {
        listingId: testListing.id,
        date: '2023-01-04',
        price: 150.0,
        isAvailable: false,
      },
    ]);
    
    // 검색이 안되어야하는 숙소
    await listingEntityRepository.save({
      hostId: testUser.id,
      name: '다른 숙소',
      description: '다른 장소',
      guestCapacity: 2,
      infantCapacity: 0,
      address: '456 다른 거리',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('ListingRepository가 정의되어야 한다', () => {
    expect(listingRepository).toBeDefined();
  });

  describe('searchListings', () => {
    it('모든 검색 조건(날짜, 가격, 인원)을 만족하는 숙소 1개를 반환한다', async () => {
      // GIVEN: 모든 조건을 만족하는 검색 DTO
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2023-01-01',
        toDate: '2023-01-03',
        minPrice: 100,
        maxPrice: 200,
        guestSize: 4,
        infantSize: 1,
      };

      // WHEN: searchListings 메서드를 호출한다
      const result = await listingRepository.searchListings(searchDto);

      // THEN: 조건에 맞는 숙소 1개를 포함한 배열을 반환한다
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(testListing.id);
      expect(result[0].schedules.length).toBe(3);
    });

    it('가격 조건에 맞지 않는 숙소가 있을 때, 빈 배열을 반환한다', async () => {
      // GIVEN: 가격 조건이 맞지 않는 검색 DTO
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2023-01-01',
        toDate: '2023-01-03',
        minPrice: 500, // 너무 높은 가격
        maxPrice: 1000,
        guestSize: 4,
        infantSize: 1,
      };

      // WHEN: searchListings 메서드를 호출한다
      const result = await listingRepository.searchListings(searchDto);

      // THEN: 빈 배열을 반환한다
      expect(result.length).toBe(0);
    });

    it('검색 기간 중 예약 불가능한 날짜가 포함될 때, 빈 배열을 반환한다', async () => {
      // GIVEN: 예약 불가능한 날짜(1월 4일)를 포함하는 검색 DTO
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2023-01-01',
        toDate: '2023-01-04',
        minPrice: 100,
        maxPrice: 200,
        guestSize: 4,
        infantSize: 1,
      };

      // WHEN: searchListings 메서드를 호출한다
      const result = await listingRepository.searchListings(searchDto);

      // THEN: 빈 배열을 반환한다
      expect(result.length).toBe(0);
    });
  });
});
