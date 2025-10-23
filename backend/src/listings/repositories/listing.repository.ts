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

    const query = this.createQueryBuilder('listing')
      .innerJoinAndSelect('listing.schedules', 'schedule') // schedules 관계를 로드
      .where('listing.guestCapacity >= :guestSize', { guestSize })
      .andWhere('listing.infantCapacity >= :infantSize', { infantSize })
      .andWhere('schedule.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('schedule.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('schedule.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice })
      .groupBy('listing.id, listing.hostId, listing.name, listing.description, listing.guestCapacity, listing.infantCapacity, listing.address')
      .having('COUNT(DISTINCT schedule.date) = :diffDays', { diffDays });

    return query.getMany();
  }
}
