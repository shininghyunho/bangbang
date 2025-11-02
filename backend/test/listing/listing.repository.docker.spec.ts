import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { ListingRepository } from '../../src/listings/repositories/listing.repository';
import { Listing } from '../../src/listings/entities/listing.entity';
import { ListingSchedule } from '../../src/listings/entities/listing-schedule.entity';
import { User } from '../../src/users/entities/user.entity';
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
  let testSchedules: ListingSchedule[];

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
            entities: [Listing, ListingSchedule, User],
            synchronize: true,
            dropSchema: true,
            logging: false,
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Listing, ListingSchedule, User]),
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
    testSchedules = [];
    testSchedules.push(
      await listingScheduleRepository.save({
        listingId: testListing.id,
        date: '2023-01-01',
        price: 150.0,
        isAvailable: true,
      }),
    );
    testSchedules.push(
      await listingScheduleRepository.save({
        listingId: testListing.id,
        date: '2023-01-02',
        price: 150.0,
        isAvailable: true,
      }),
    );
    testSchedules.push(
      await listingScheduleRepository.save({
        listingId: testListing.id,
        date: '2023-01-03',
        price: 150.0,
        isAvailable: true,
      }),
    );
    testSchedules.push(
      await listingScheduleRepository.save({
        listingId: testListing.id,
        date: '2023-01-04',
        price: 150.0,
        isAvailable: false,
      }),
    );
    
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
    it('검색 조건과 일치하는 숙소를 반환해야 한다', async () => {
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2023-01-01',
        toDate: '2023-01-03',
        minPrice: 100,
        maxPrice: 200,
        guestSize: 4,
        infantSize: 1,
      };

      const result = await listingRepository.searchListings(searchDto);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(testListing.id);
      expect(result[0].name).toBe('테스트 숙소');
      expect(result[0].schedules).toBeInstanceOf(Array);
      expect(result[0].schedules.length).toBe(3);
      expect(
        result[0].schedules.some((s) => (s.date as Date).toISOString().startsWith('2023-01-01')),
      ).toBeTruthy();
      expect(
        result[0].schedules.some((s) => (s.date as Date).toISOString().startsWith('2023-01-02')),
      ).toBeTruthy();
      expect(
        result[0].schedules.some((s) => (s.date as Date).toISOString().startsWith('2023-01-03')),
      ).toBeTruthy();
      expect(
        result[0].schedules.every((s) => s.isAvailable === true),
      ).toBeTruthy();
      expect(
        result[0].schedules.every(
          (s) => s.price >= searchDto.minPrice && s.price <= searchDto.maxPrice,
        ),
      ).toBeTruthy();
    });

    it('조건과 일치하는 숙소가 없으면 빈 배열을 반환해야 한다', async () => {
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2023-01-01',
        toDate: '2023-01-03',
        minPrice: 10,
        maxPrice: 20,
        guestSize: 4,
        infantSize: 1,
      };

      const result = await listingRepository.searchListings(searchDto);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });

    it('충분한 예약 가능 날짜가 없으면 빈 배열을 반환해야 한다', async () => {
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2023-01-01',
        toDate: '2023-01-04',
        minPrice: 100,
        maxPrice: 200,
        guestSize: 4,
        infantSize: 1,
      };

      const result = await listingRepository.searchListings(searchDto);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });
  });
});
