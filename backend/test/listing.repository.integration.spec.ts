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

describe('ListingRepository (Integration)', () => {
  let app: INestApplication;
  let listingRepository: ListingRepository;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let listingEntityRepository: Repository<Listing>;
  let listingScheduleRepository: Repository<ListingSchedule>;

  // Test data
  let testUser: User;
  let testListing: Listing;
  let testSchedules: ListingSchedule[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test', // Use a separate .env for testing if needed, or rely on docker-compose env
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
            synchronize: true, // Be careful with synchronize: true in production
            logging: false,
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Listing, ListingSchedule, User]), // Import entities for direct repository access
      ],
      // providers: [ListingRepository], // <--- REMOVE THIS LINE
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    // Get ListingRepository from the DataSource
    listingRepository = new ListingRepository(dataSource);
    userRepository = dataSource.getRepository(User);
    listingEntityRepository = dataSource.getRepository(Listing);
    listingScheduleRepository = dataSource.getRepository(ListingSchedule);

    // Clear database before tests
    await listingScheduleRepository.query('SET FOREIGN_KEY_CHECKS = 0;');
    await listingScheduleRepository.clear();
    await listingEntityRepository.clear();
    await userRepository.clear();
    await listingScheduleRepository.query('SET FOREIGN_KEY_CHECKS = 1;');

    // Insert test data
    testUser = await userRepository.save({
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    });

    testListing = await listingEntityRepository.save({
      hostId: testUser.id,
      name: 'Test Listing',
      description: 'A lovely place',
      guestCapacity: 4,
      infantCapacity: 1,
      address: '123 Test St',
    });

    testSchedules = [];
    // Available for 2023-01-01, 2023-01-02, 2023-01-03
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
    // Not available for 2023-01-04
    testSchedules.push(await listingScheduleRepository.save({
      listingId: testListing.id,
      date: '2023-01-04',
      price: 150.00,
      isAvailable: false,
    }));
    // Another listing, not matching criteria
    await listingEntityRepository.save({
      hostId: testUser.id,
      name: 'Another Listing',
      description: 'Another place',
      guestCapacity: 2,
      infantCapacity: 0,
      address: '456 Other St',
    });
  });

  afterAll(async () => {
    // Clear database after tests
    await listingScheduleRepository.query('SET FOREIGN_KEY_CHECKS = 0;');
    await listingScheduleRepository.clear();
    await listingEntityRepository.clear();
    await userRepository.clear();
    await listingScheduleRepository.query('SET FOREIGN_KEY_CHECKS = 1;');
    await app.close();
  });

  it('should be defined', () => {
    expect(listingRepository).toBeDefined();
  });

  describe('searchListings', () => {
    it('should return listings matching the search criteria', async () => {
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
      expect(result[0].name).toBe('Test Listing');
      // Add more assertions to verify the schedules are correctly joined and filtered
      expect(result[0].schedules).toBeInstanceOf(Array);
      expect(result[0].schedules.length).toBe(3); // Should only include available schedules within the date range
      expect(result[0].schedules.some(s => s.date === '2023-01-01')).toBeTruthy();
      expect(result[0].schedules.some(s => s.date === '2023-01-02')).toBeTruthy();
      expect(result[0].schedules.some(s => s.date === '2023-01-03')).toBeTruthy();
      expect(result[0].schedules.every(s => s.isAvailable === true)).toBeTruthy();
      expect(result[0].schedules.every(s => s.price >= searchDto.minPrice && s.price <= searchDto.maxPrice)).toBeTruthy();
    });

    it('should return an empty array if no listings match the criteria', async () => {
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2023-01-01',
        toDate: '2023-01-03',
        minPrice: 10,
        maxPrice: 20, // Price range that won't match
        guestSize: 4,
        infantSize: 1,
      };

      const result = await listingRepository.searchListings(searchDto);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });

    it('should return an empty array if not enough available dates', async () => {
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2023-01-01',
        toDate: '2023-01-04', // This range includes an unavailable date
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