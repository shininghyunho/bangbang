import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestDbContainer } from '../test-db.container';
import { DataSource } from 'typeorm';
import { User } from '../../src/users/entities/user.entity';
import { Listing } from '../../src/listings/entities/listing.entity';
import { ListingSchedule } from '../../src/listings/entities/listing-schedule.entity';

describe('숙소 검색 API E2E 테스트 (GET /listings/search)', () => {
  let app: INestApplication;
  let testDb: TestDbContainer;
  let dataSource: DataSource;

  beforeAll(async () => {
    testDb = new TestDbContainer();
    dataSource = await testDb.start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 60000);

  afterAll(async () => {
    await app.close();
    await testDb.stop();
  });

  describe('GIVEN: 3박 4일 일정으로, 가격이 서로 다른 숙소가 3개 등록된 상황에서', () => {
    beforeEach(async () => {
      // 데이터 초기화
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
      await dataSource.query('TRUNCATE TABLE listing_schedule');
      await dataSource.query('TRUNCATE TABLE listings');
      await dataSource.query('TRUNCATE TABLE users');
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

      const userRepo = dataSource.getRepository(User);
      const host = await userRepo.save({
        email: 'e2e-host@test.com',
        password: 'pass',
        name: 'host',
      });

      const listingRepo = dataSource.getRepository(Listing);
      const scheduleRepo = dataSource.getRepository(ListingSchedule);

      // 숙소 A (매일 10,000원, 4일 일정)
      const listingA = await listingRepo.save({
        hostId: host.id,
        name: '숙소 A',
        description: 'E2E 숙소 A',
        guestCapacity: 2,
        infantCapacity: 1,
        address: '서울',
      });
      for (let i = 1; i <= 4; i++) {
        await scheduleRepo.save({
          listingId: listingA.id,
          date: `2025-01-0${i}`,
          price: 10000,
          isAvailable: true,
        });
      }

      // 숙소 B (매일 20,000원, 4일 일정)
      const listingB = await listingRepo.save({
        hostId: host.id,
        name: '숙소 B',
        description: 'E2E 숙소 B',
        guestCapacity: 2,
        infantCapacity: 1,
        address: '부산',
      });
      for (let i = 1; i <= 4; i++) {
        await scheduleRepo.save({
          listingId: listingB.id,
          date: `2025-01-0${i}`,
          price: 20000,
          isAvailable: true,
        });
      }

      // 숙소 C (매일 10,000원, 4일차 예약 불가)
      const listingC = await listingRepo.save({
        hostId: host.id,
        name: '숙소 C',
        description: 'E2E 숙소 C',
        guestCapacity: 2,
        infantCapacity: 1,
        address: '인천',
      });
      for (let i = 1; i <= 4; i++) {
        await scheduleRepo.save({
          listingId: listingC.id,
          date: `2025-01-0${i}`,
          price: 10000,
          isAvailable: i !== 4,
        });
      }
    });

    describe('WHEN: 사용자가 2025-01-01부터 2025-01-04까지의 일정으로 검색 API를 호출한다면', () => {
      const searchUrl = '/listings/search?fromDate=2025-01-01&toDate=2025-01-04&minPrice=0&maxPrice=100000&guestSize=1&infantSize=0';

      it('THEN: HTTP 응답 코드는 200(OK)이어야 한다', async () => {
        const response = await request(app.getHttpServer()).get(searchUrl);
        expect(response.status).toBe(200);
      });

      it('THEN: 응답 결과의 개수는 예약 가능한 숙소 수인 2개여야 한다', async () => {
        const response = await request(app.getHttpServer()).get(searchUrl);
        expect(response.body).toHaveLength(2);
      });

      it('THEN: 첫 번째 검색 결과인 숙소 A는 정확한 totalPrice(40,000)를 포함해야 한다', async () => {
        const response = await request(app.getHttpServer()).get(searchUrl);
        const listingA = response.body.find((item: any) => item.name === '숙소 A');
        expect(listingA.totalPrice).toBe(40000);
      });

      it('THEN: 응답 데이터는 숙소의 정원 정보(guestCapacity: 2, infantCapacity: 1)를 정확히 포함해야 한다', async () => {
        const response = await request(app.getHttpServer()).get(searchUrl);
        const item = response.body[0];
        expect(item.guestCapacity).toBe(2);
        expect(item.infantCapacity).toBe(1);
      });
    });
  });
});
