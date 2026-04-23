import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Listing } from '../entities/listing.entity';
import { SearchListingsRequestDto } from '../dto/search-listings.request.dto';
import { ListingSearchResponseDto } from '../dto/listing-search.response.dto';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Injectable()
export class ListingRepository {
  constructor(
    @InjectRepository(Listing)
    private readonly repository: Repository<Listing>,
    private readonly dataSource: DataSource,
  ) {}

  async searchListings(
    searchDto: SearchListingsRequestDto,
  ): Promise<ListingSearchResponseDto[]> {
    const { fromDate, toDate, minPrice, maxPrice, guestSize, infantSize } =
      searchDto;

    const startUtcDate = new Date(`${fromDate}T00:00:00Z`);
    const endUtcDate = new Date(`${toDate}T00:00:00Z`);

    const diffTime = endUtcDate.getTime() - startUtcDate.getTime();
    const diffDays = diffTime / MS_PER_DAY + 1;

    const rawQuery = `
      SELECT 
          l.id,
          l.name, 
          l.description, 
          l.address, 
          l.guestCapacity, 
          l.infantCapacity,
          SUM(ls.price) AS totalPrice
      FROM listings AS l
      INNER JOIN listing_schedule AS ls ON l.id = ls.listingId
      WHERE ls.date BETWEEN ? AND ?
        AND ls.isAvailable = 1
        AND ls.price BETWEEN ? AND ?
        AND l.guestCapacity >= ?
        AND l.infantCapacity >= ?
      GROUP BY l.id
      HAVING COUNT(ls.date) = ?
      ORDER BY totalPrice ASC, l.id
      LIMIT 100;
    `;

    const parameters = [
      fromDate,
      toDate,
      minPrice,
      maxPrice,
      guestSize,
      infantSize,
      diffDays,
    ];

    const results = await this.dataSource.query(rawQuery, parameters);

    return results.map((row) => ({
      name: row.name,
      description: row.description,
      address: row.address,
      totalPrice: Number(row.totalPrice),
      guestCapacity: row.guestCapacity,
      infantCapacity: row.infantCapacity,
    }));
  }

  async selectLimit10(): Promise<Listing[]> {
    return this.repository.createQueryBuilder('listing').take(10).getMany();
  }
}
