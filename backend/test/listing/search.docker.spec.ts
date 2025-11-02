import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import mysql2 from 'mysql2';
import request from 'supertest';

import { Listing } from '../../src/listings/entities/listing.entity';
import { ListingSchedule } from '../../src/listings/entities/listing-schedule.entity';
import { User } from '../../src/users/entities/user.entity';
import { OauthAccount } from '../../src/auth/entities/oauth_account.entity';
import { Provider } from '../../src/auth/entities/provider.entity';
import { ListingModule } from '../../src/listings/listing.module';
import { SearchListingsRequestDto } from '../../src/listings/dto/search-listings.request.dto';

describe('ListingController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let listingRepository: Repository<Listing>;
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
        ListingModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    userRepository = dataSource.getRepository(User);
    listingRepository = dataSource.getRepository(Listing);
    listingScheduleRepository = dataSource.getRepository(ListingSchedule);

    // GIVEN: 테스트용 데이터베이스에 데이터가 존재한다.
    // 유저
    testUser = await userRepository.save({
      email: 'test@example.com',
      password: 'password',
      name: '테스트 사용자',
    });

    // 숙소
    testListing = await listingRepository.save({
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
        isAvailable: false, // 예약 불가능한 날짜
      },
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/listings/search (GET)', () => {
    it('성공: 검색 조건에 완벽히 일치하는 숙소가 있을 때, 해당 숙소 정보를 반환한다', async () => {
      // GIVEN: 모든 조건(날짜, 가격, 인원)을 만족하는 검색 DTO
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2023-01-01',
        toDate: '2023-01-03',
        minPrice: 100,
        maxPrice: 200,
        guestSize: 4,
        infantSize: 1,
      };

      // WHEN: /listings/search API를 호출한다
      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query(searchDto);

      // THEN: 200 OK 상태 코드와 함께, 조건에 맞는 숙소 1개를 반환한다
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe(testListing.name);
      expect(response.body[0].totalPrice).toBe(450); // 150 * 3
    });

    it('성공: 검색 조건에 일치하는 숙소가 없을 때, 빈 배열을 반환한다', async () => {
      // GIVEN: 가격 조건에 맞지 않는 검색 DTO
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2023-01-01',
        toDate: '2023-01-03',
        minPrice: 500, // 너무 높은 가격
        maxPrice: 1000,
        guestSize: 4,
        infantSize: 1,
      };

      // WHEN: /listings/search API를 호출한다
      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query(searchDto);

      // THEN: 200 OK 상태 코드와 함께, 빈 배열을 반환한다
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('성공: 검색 기간 중 예약 불가능한 날짜가 포함되어 있을 때, 빈 배열을 반환한다', async () => {
      // GIVEN: 예약 불가능한 날짜(1월 4일)를 포함하는 검색 DTO
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2023-01-01',
        toDate: '2023-01-04',
        minPrice: 100,
        maxPrice: 200,
        guestSize: 4,
        infantSize: 1,
      };

      // WHEN: /listings/search API를 호출한다
      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query(searchDto);

      // THEN: 200 OK 상태 코드와 함께, 빈 배열을 반환한다
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});