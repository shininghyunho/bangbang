import { DataSource } from 'typeorm';
import { ListingRepository } from '../../src/listings/repositories/listing.repository';
import { SearchListingsRequestDto } from '../../src/listings/dto/search-listings.request.dto';
import { Listing } from '../../src/listings/entities/listing.entity';

describe('ListingRepository 단위 테스트', () => {
  let listingRepository: ListingRepository;
  let dataSource: Partial<DataSource>;

  // 쿼리 빌더 모의 객체
  const mockSubQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    getQuery: jest.fn().mockReturnValue('SELECT listing_sub.id FROM ...'), // 서브쿼리 문자열 모의
    getParameters: jest.fn().mockReturnValue({ param1: 'value1' }), // 서브쿼리 파라미터 모의
  };

  const mockMainQueryBuilder = {
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    getMany: jest.fn(), // getMany는 동적으로 모의 값을 설정
  };

  beforeEach(() => {
    dataSource = {
      createEntityManager: jest.fn(),
    };
    listingRepository = new ListingRepository(dataSource as DataSource);

    // 각 테스트 전에 모의 객체 초기화
    jest.clearAllMocks();

    // createQueryBuilder가 별칭에 따라 다른 모의 빌더를 반환하도록 설정
    jest.spyOn(listingRepository, 'createQueryBuilder').mockImplementation((alias: string) => {
      if (alias === 'listing_sub') {
        return mockSubQueryBuilder as any;
      }
      if (alias === 'listing') {
        return mockMainQueryBuilder as any;
      }
      throw new Error(`createQueryBuilder에 예기치 않은 별칭이 사용되었습니다: ${alias}`);
    });
  });

  it('ListingRepository가 정의되어야 합니다.', () => {
    expect(listingRepository).toBeDefined();
  });

  describe('searchListings', () => {
    it('서브쿼리와 메인쿼리를 사용하여 올바른 쿼리를 빌드하고 실행해야 합니다.', async () => {
      const searchDto: SearchListingsRequestDto = {
        fromDate: '2024-01-01',
        toDate: '2024-01-03',
        minPrice: 100,
        maxPrice: 500,
        guestSize: 2,
        infantSize: 1,
      };
      const mockListings: Listing[] = [{ id: 1, name: '테스트 숙소' } as Listing];

      // getMany가 모의 숙소 목록을 반환하도록 설정
      mockMainQueryBuilder.getMany.mockResolvedValue(mockListings);

      const result = await listingRepository.searchListings(searchDto);

      const startDate = new Date(searchDto.fromDate);
      const endDate = new Date(searchDto.toDate);
      const diffDays = 3; // '2024-01-01'부터 '2024-01-03'까지는 3일

      // --- 서브쿼리 호출 검증 ---
      expect(listingRepository.createQueryBuilder).toHaveBeenCalledWith('listing_sub');
      expect(mockSubQueryBuilder.select).toHaveBeenCalledWith('listing_sub.id');
      expect(mockSubQueryBuilder.innerJoin).toHaveBeenCalledWith('listing_sub.schedules', 'schedule_sub');
      expect(mockSubQueryBuilder.where).toHaveBeenCalledWith('schedule_sub.date BETWEEN :startDate AND :endDate', { startDate, endDate });
      expect(mockSubQueryBuilder.andWhere).toHaveBeenCalledWith('schedule_sub.isAvailable = :isAvailable', { isAvailable: true });
      expect(mockSubQueryBuilder.andWhere).toHaveBeenCalledWith('schedule_sub.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: searchDto.minPrice,
        maxPrice: searchDto.maxPrice,
      });
      expect(mockSubQueryBuilder.groupBy).toHaveBeenCalledWith('listing_sub.id');
      expect(mockSubQueryBuilder.having).toHaveBeenCalledWith('COUNT(DISTINCT schedule_sub.date) = :diffDays', { diffDays });

      // --- 메인쿼리 호출 검증 ---
      expect(listingRepository.createQueryBuilder).toHaveBeenCalledWith('listing');
      expect(mockMainQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith('listing.schedules', 'schedule');
      expect(mockMainQueryBuilder.where).toHaveBeenCalledWith('listing.guestCapacity >= :guestSize', { guestSize: searchDto.guestSize });
      expect(mockMainQueryBuilder.andWhere).toHaveBeenCalledWith('listing.infantCapacity >= :infantSize', { infantSize: searchDto.infantSize });
      expect(mockMainQueryBuilder.andWhere).toHaveBeenCalledWith('listing.id IN (' + mockSubQueryBuilder.getQuery() + ')');
      expect(mockMainQueryBuilder.andWhere).toHaveBeenCalledWith('schedule.date BETWEEN :startDate AND :endDate', { startDate, endDate });
      expect(mockMainQueryBuilder.andWhere).toHaveBeenCalledWith('schedule.isAvailable = :isAvailable', { isAvailable: true });
      expect(mockMainQueryBuilder.andWhere).toHaveBeenCalledWith('schedule.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: searchDto.minPrice,
        maxPrice: searchDto.maxPrice,
      });
      expect(mockMainQueryBuilder.setParameters).toHaveBeenCalledWith(mockSubQueryBuilder.getParameters());
      expect(mockMainQueryBuilder.getMany).toHaveBeenCalled();

      // --- 최종 결과 검증 ---
      expect(result).toEqual(mockListings);
    });
  });
});