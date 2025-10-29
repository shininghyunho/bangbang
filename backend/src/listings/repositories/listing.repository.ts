import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Listing } from '../entities/listing.entity';
import { SearchListingsRequestDto } from '../dto/search-listings.request.dto';
import { ListingSchedule } from '../entities/listing-schedule.entity';

const MS_PER_DAY = 1000 * 60 * 60 * 24; // Milliseconds in a day

@Injectable()
export class ListingRepository {
  constructor(
    @InjectRepository(Listing)
    private readonly repository: Repository<Listing>,
    private readonly dataSource: DataSource,
  ) {}

  private readonly logger = new Logger(ListingRepository.name);


  async searchListings(searchDto: SearchListingsRequestDto): Promise<Listing[]> {
    const { fromDate, toDate, minPrice, maxPrice, guestSize, infantSize } = searchDto;

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / MS_PER_DAY) + 1;

    // 서브쿼리
    const subQuery = this.dataSource
      .createQueryBuilder(ListingSchedule, 'schedule_sub')
      .select('schedule_sub.listingId')
      .where('schedule_sub.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('schedule_sub.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('schedule_sub.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice })
      .groupBy('schedule_sub.listingId')
      .having('COUNT(schedule_sub.date) = :diffDays', { diffDays });

    // 메인 쿼리
    const query = this.repository
      .createQueryBuilder('listing')
      .innerJoinAndSelect('listing.schedules', 'schedule')
      .where('listing.guestCapacity >= :guestSize', { guestSize })
      .andWhere('listing.infantCapacity >= :infantSize', { infantSize })
      .andWhere('listing.id IN (' + subQuery.getQuery() + ')')
      // 더블 체크
      .andWhere('schedule.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('schedule.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('schedule.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });

    query.setParameters(subQuery.getParameters());

    // 생성된 SQL과 파라미터 로깅
    this.logger.debug(`Executing query: ${query.getSql()}`);
    this.logger.debug(`With parameters: ${JSON.stringify(query.getParameters())}`);
    
    return query.getMany();
  }
}
