import { DataSource } from 'typeorm';
import { ListingRepository } from '../../src/listings/repositories/listing.repository';
import { TestDbContainer } from '../test-db.container';
import { SearchListingsRequestDto } from '../../src/listings/dto/search-listings.request.dto';
import { Listing } from '../../src/listings/entities/listing.entity';
import { ListingSchedule } from '../../src/listings/entities/listing-schedule.entity';
import { User } from '../../src/users/entities/user.entity';

describe('숙소 검색 Repository 통합 테스트 (Optimized Query)', () => {
  let dataSource: DataSource;
  let repository: ListingRepository;
  let testDb: TestDbContainer;

  beforeAll(async () => {
    testDb = new TestDbContainer();
    dataSource = await testDb.start();
    repository = new ListingRepository(
      dataSource.getRepository(Listing),
      dataSource,
    );
  }, 60000); // 컨테이너 구동 시간을 고려하여 타임아웃 60초 설정

  afterAll(async () => {
    await testDb.stop();
  });

  describe('GIVEN: 3박 4일 일정으로, 가격이 서로 다른 숙소가 3개 등록된 상황에서', () => {
    const fromDate = '2025-01-01';
    const toDate = '2025-01-04'; // 총 4일 일정 (1, 2, 3, 4일)
    const diffDays = 4;

    beforeEach(async () => {
      // 0. 테스트 격리를 위한 데이터 삭제 (FK 제약 조건 고려)
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
      await dataSource.query('TRUNCATE TABLE listing_schedule');
      await dataSource.query('TRUNCATE TABLE listings');
      await dataSource.query('TRUNCATE TABLE users');
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

      // 1. 테스트용 호스트(User) 생성
      const userRepo = dataSource.getRepository(User);
      const host = await userRepo.save({
        email: 'test@test.com',
        password: 'pass',
        name: 'host',
      });

      const listingRepo = dataSource.getRepository(Listing);
      const scheduleRepo = dataSource.getRepository(ListingSchedule);

      // 2. 숙소 A (매일 10,000원): 모든 일정 예약 가능
      const listingA = await listingRepo.save({
        hostId: host.id,
        name: '숙소 A',
        description: '저렴한 숙소',
        guestCapacity: 2,
        infantCapacity: 1,
        address: '서울',
      });
      const schedulesA = [];
      for (let i = 1; i <= diffDays; i++) {
        schedulesA.push({
          listingId: listingA.id,
          date: `2025-01-0${i}`,
          price: 10000,
          isAvailable: true,
        });
      }
      await scheduleRepo.save(schedulesA);

      // 3. 숙소 B (매일 20,000원): 모든 일정 예약 가능
      const listingB = await listingRepo.save({
        hostId: host.id,
        name: '숙소 B',
        description: '비싼 숙소',
        guestCapacity: 2,
        infantCapacity: 1,
        address: '부산',
      });
      const schedulesB = [];
      for (let i = 1; i <= diffDays; i++) {
        schedulesB.push({
          listingId: listingB.id,
          date: `2025-01-0${i}`,
          price: 20000,
          isAvailable: true,
        });
      }
      await scheduleRepo.save(schedulesB);

      // 4. 숙소 C (매일 10,000원): 일부 일정(1월 4일) 예약 불가능
      const listingC = await listingRepo.save({
        hostId: host.id,
        name: '숙소 C',
        description: '예약 불가 일정 포함 숙소',
        guestCapacity: 2,
        infantCapacity: 1,
        address: '인천',
      });
      const schedulesC = [];
      for (let i = 1; i <= diffDays; i++) {
        schedulesC.push({
          listingId: listingC.id,
          date: `2025-01-0${i}`,
          price: 10000,
          isAvailable: i !== 4, // 4일차는 예약 불가
        });
      }
      await scheduleRepo.save(schedulesC);
    });

    describe('WHEN: 사용자가 2025-01-01부터 2025-01-04까지의 일정으로 검색을 수행한다면', () => {
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2025-01-01',
        toDate: '2025-01-04',
        minPrice: 0,
        maxPrice: 100000,
        guestSize: 1,
        infantSize: 0,
      };

      it('THEN: 예약 가능한 숙소(A, B)만 검색 결과에 포함되어야 한다 (총 2개)', async () => {
        const results = await repository.searchListings(searchDto);
        expect(results).toHaveLength(2);
      });

      it('THEN: 첫 번째 결과(숙소 A)의 totalPrice는 40,000원(10,000원 * 4일)이어야 한다', async () => {
        const results = await repository.searchListings(searchDto);
        const listingA = results.find((r) => r.name === '숙소 A');
        expect(listingA?.totalPrice).toBe(40000);
      });

      it('THEN: 결과는 가격 오름차순으로 정렬되어 숙소 A가 첫 번째로 나와야 한다', async () => {
        const results = await repository.searchListings(searchDto);
        expect(results[0].name).toBe('숙소 A');
        expect(results[0].totalPrice).toBeLessThan(results[1].totalPrice);
      });

      it('THEN: 반환된 각 숙소의 guestCapacity와 infantCapacity 정보는 등록된 데이터와 일치해야 한다', async () => {
        const results = await repository.searchListings(searchDto);
        const item = results[0];
        expect(item.guestCapacity).toBe(2);
        expect(item.infantCapacity).toBe(1);
      });
    });
  });
});
