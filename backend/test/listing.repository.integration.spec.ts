import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { ListingRepository } from '../src/listings/repositories/listing.repository';
import { Listing } from '../src/listings/entities/listing.entity';
import { ListingSchedule } from '../src/listings/entities/listing-schedule.entity';
import { User } from '../src/users/entities/user.entity';
import { SearchListingsRequestDto } from '../src/listings/dto/search-listings.request.dto';

describe('ListingRepository (통합 테스트)', () => {
  let app: INestApplication;
  let listingRepository: ListingRepository;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let listingEntityRepository: Repository<Listing>;
  let listingScheduleRepository: Repository<ListingSchedule>;

  // 테스트 데이터
  let testUser: User;
  let testListing: Listing;
  let testSchedules: ListingSchedule[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test', // 필요한 경우 테스트용 .env 파일을 사용하거나 docker-compose 환경 변수를 사용
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.get<string>('DATABASE_HOST'),
            port: configService.get<number>('DATABASE_PORT'),
            username: configService.get<string>('DATABASE_USER'),
            password: configService.get<string>('DATABASE_PASSWORD'),
            database: configService.get<string>('DATABASE_NAME'),
            entities: [Listing, ListingSchedule, User],
            synchronize: true, // 프로덕션에서는 synchronize: true를 주의해서 사용하세요
            logging: false,
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Listing, ListingSchedule, User]), // 리포지토리 직접 접근을 위한 엔티티 임포트
      ],
      // providers: [ListingRepository], // <--- 이 줄을 제거
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    // DataSource에서 ListingRepository 가져오기
    listingRepository = new ListingRepository(dataSource);
    userRepository = dataSource.getRepository(User);
    listingEntityRepository = dataSource.getRepository(Listing);
    listingScheduleRepository = dataSource.getRepository(ListingSchedule);

    // 테스트 전에 데이터베이스 초기화
    await listingScheduleRepository.query('SET FOREIGN_KEY_CHECKS = 0;');
    await listingScheduleRepository.clear();
    await listingEntityRepository.clear();
    await userRepository.clear();
    await listingScheduleRepository.query('SET FOREIGN_KEY_CHECKS = 1;');

    // 테스트 데이터 삽입
    testUser = await userRepository.save({
      email: 'test@example.com',
      password: 'password',
      name: '테스트 사용자',
    });

    testListing = await listingEntityRepository.save({
      hostId: testUser.id,
      name: '테스트 숙소',
      description: '아름다운 장소',
      guestCapacity: 4,
      infantCapacity: 1,
      address: '123 테스트 거리',
    });

    testSchedules = [];
    // 2023-01-01, 2023-01-02, 2023-01-03 예약 가능
    testSchedules.push(await listingScheduleRepository.save({
      listingId: testListing.id,
      date: '2023-01-01',
      price: 150.00,
      isAvailable: true,
    }));
    testSchedules.push(await listingScheduleRepository.save({
      listingId: testListing.id,
      date: '2023-01-02',
      price: 150.00,
      isAvailable: true,
    }));
    testSchedules.push(await listingScheduleRepository.save({
      listingId: testListing.id,
      date: '2023-01-03',
      price: 150.00,
      isAvailable: true,
    }));
    // 2023-01-04 예약 불가능
    testSchedules.push(await listingScheduleRepository.save({
      listingId: testListing.id,
      date: '2023-01-04',
      price: 150.00,
      isAvailable: false,
    }));
    // 다른 숙소, 검색 조건과 일치하지 않음
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
    // 테스트 후 데이터베이스 초기화
    await listingScheduleRepository.query('SET FOREIGN_KEY_CHECKS = 0;');
    await listingScheduleRepository.clear();
    await listingEntityRepository.clear();
    await userRepository.clear();
    await listingScheduleRepository.query('SET FOREIGN_KEY_CHECKS = 1;');
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
      // 스케줄이 올바르게 조인되고 필터링되었는지 확인하기 위한 추가 검증
      expect(result[0].schedules).toBeInstanceOf(Array);
      expect(result[0].schedules.length).toBe(3); // 날짜 범위 내의 예약 가능한 스케줄만 포함되어야 한다
      expect(result[0].schedules.some(s => s.date === '2023-01-01')).toBeTruthy();
      expect(result[0].schedules.some(s => s.date === '2023-01-02')).toBeTruthy();
      expect(result[0].schedules.some(s => s.date === '2023-01-03')).toBeTruthy();
      expect(result[0].schedules.every(s => s.isAvailable === true)).toBeTruthy();
      expect(result[0].schedules.every(s => s.price >= searchDto.minPrice && s.price <= searchDto.maxPrice)).toBeTruthy();
    });

    it('조건과 일치하는 숙소가 없으면 빈 배열을 반환해야 한다', async () => {
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2023-01-01',
        toDate: '2023-01-03',
        minPrice: 10,
        maxPrice: 20, // 일치하지 않는 가격 범위
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
        toDate: '2023-01-04', // 예약 불가능한 날짜를 포함하는 범위
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