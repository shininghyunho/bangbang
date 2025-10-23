
import { DataSource } from 'typeorm';
import { ListingRepository } from './listing.repository';
import { SearchListingsRequestDto } from '../dto/search-listings.request.dto';

describe('ListingRepository', () => {
  let listingRepository: ListingRepository;
  let dataSource: Partial<DataSource>;

  beforeEach(async () => {
    dataSource = {
      createEntityManager: jest.fn(),
    };

    listingRepository = new ListingRepository(dataSource as DataSource);
  });

  it('should be defined', () => {
    expect(listingRepository).toBeDefined();
  });

  describe('searchListings', () => {
    it('should build and execute the correct query', async () => {
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2024-01-01',
        toDate: '2024-01-03',
        minPrice: 100,
        maxPrice: 500,
        guestSize: 2,
        infantSize: 1,
      };

      const mockListings = [{ id: 1, guestCapacity: 2, infantCapacity: 1 }];

      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockListings),
      };

      jest.spyOn(listingRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await listingRepository.searchListings(searchDto);

      expect(listingRepository.createQueryBuilder).toHaveBeenCalledWith('listing');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith('listing.schedules', 'schedule');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('listing.guestCapacity >= :guestSize', { guestSize: searchDto.guestSize });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('listing.infantCapacity >= :infantSize', { infantSize: searchDto.infantSize });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('schedule.date BETWEEN :startDate AND :endDate', {
        startDate: new Date(searchDto.fromDate),
        endDate: new Date(searchDto.toDate),
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('schedule.isAvailable = :isAvailable', { isAvailable: true });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('schedule.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: searchDto.minPrice,
        maxPrice: searchDto.maxPrice,
      });
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('listing.id');
      expect(mockQueryBuilder.having).toHaveBeenCalledWith('COUNT(DISTINCT schedule.date) = :diffDays', { diffDays: 3 }); // 2024-01-01 to 2024-01-03 is 3 days
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(mockListings);
    });
  });
});
