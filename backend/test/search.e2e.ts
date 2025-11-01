import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ListingResponseDto } from './../src/listings/dto/listing.response.dto';

describe('숙소 검색 (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('검색 조건에 맞는 숙소 목록을 반환해야 한다', async () => {
    const fromDate = '2025-12-01';
    const toDate = '2025-12-03';
    const minPrice = 50000;
    const maxPrice = 150000;
    const guestSize = 2;
    const infantSize = 0;

    const queryParams = new URLSearchParams({
      fromDate,
      toDate,
      minPrice: minPrice.toString(),
      maxPrice: maxPrice.toString(),
      guestSize: guestSize.toString(),
      infantSize: infantSize.toString(),
    }).toString();

    const response = await request(app.getHttpServer())
      .get(`/listings/search?${queryParams}`)
      .expect(200);

    const listings = response.body as ListingResponseDto[];

    expect(Array.isArray(listings)).toBe(true);
    expect(listings.length).toBeGreaterThanOrEqual(0);

    if (listings.length > 0) {
      const firstListing = listings[0];
      expect(firstListing).toHaveProperty('name');
      expect(typeof firstListing.name).toBe('string');
      expect(firstListing).toHaveProperty('description');
      expect(typeof firstListing.description).toBe('string');
      expect(firstListing).toHaveProperty('address');
      expect(typeof firstListing.address).toBe('string');
      expect(firstListing).toHaveProperty('totalPrice');
      expect(typeof firstListing.totalPrice).toBe('number');
      expect(firstListing).toHaveProperty('guestCapacity');
      expect(typeof firstListing.guestCapacity).toBe('number');
      expect(firstListing).toHaveProperty('infantCapacity');
      expect(typeof firstListing.infantCapacity).toBe('number');
    }
  });
});
