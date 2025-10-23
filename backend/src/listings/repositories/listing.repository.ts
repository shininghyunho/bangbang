import { Repository, DataSource } from 'typeorm';
import { Listing } from '../entities/listing.entity';
import { SearchListingsRequestDto } from '../dto/search-listings.request.dto';

const MS_PER_DAY = 1000 * 60 * 60 * 24; // Milliseconds in a day

export class ListingRepository extends Repository<Listing> {
  constructor(private dataSource: DataSource) {
    super(Listing, dataSource.createEntityManager());
  }

  async searchListings(searchDto: SearchListingsRequestDto): Promise<Listing[]> {
    const { fromDate, toDate, minPrice, maxPrice, guestSize, infantSize } = searchDto;

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / MS_PER_DAY) + 1;

    // 서브쿼리를 사용하여 조건을 만족하는 listingId를 찾습니다.
    const subQuery = this.createQueryBuilder('listing_sub')
      .select('listing_sub.id')
      .innerJoin('listing_sub.schedules', 'schedule_sub')
      .where('schedule_sub.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('schedule_sub.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('schedule_sub.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice })
      .groupBy('listing_sub.id')
      .having('COUNT(DISTINCT schedule_sub.date) = :diffDays', { diffDays });

    // 메인 쿼리에서 서브쿼리의 결과를 사용하여 listing을 필터링하고 schedules를 로드합니다.
    const query = this.createQueryBuilder('listing')
      .innerJoinAndSelect('listing.schedules', 'schedule')
      .where('listing.guestCapacity >= :guestSize', { guestSize })
      .andWhere('listing.infantCapacity >= :infantSize', { infantSize })
      .andWhere('listing.id IN (' + subQuery.getQuery() + ')') // 서브쿼리 결과 사용
      // 메인 쿼리에서도 schedule에 대한 필터링 조건을 추가합니다.
      .andWhere('schedule.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('schedule.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('schedule.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });

    // 서브쿼리의 파라미터를 메인 쿼리에 병합합니다.
    query.setParameters(subQuery.getParameters());

    return query.getMany();
  }
}
