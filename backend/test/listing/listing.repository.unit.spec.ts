import { DataSource, Repository } from 'typeorm';
import { ListingRepository } from '../../src/listings/repositories/listing.repository';
import { SearchListingsRequestDto } from '../../src/listings/dto/search-listings.request.dto';
import { User } from '../../src/users/entities/user.entity';
import { Listing } from '../../src/listings/entities/listing.entity';

// 모의 쿼리 빌더를 위한 타입 정의
type MockQueryBuilder = {
  select: jest.Mock;
  innerJoin: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  groupBy: jest.Mock;
  having: jest.Mock;
  getQuery: jest.Mock;
  getParameters: jest.Mock;
  innerJoinAndSelect: jest.Mock;
  setParameters: jest.Mock;
  getMany: jest.Mock;
};

describe('ListingRepository 단위 테스트', () => {
  let listingRepository: ListingRepository;
  let dataSource: Partial<DataSource>;
  let repository: Partial<Repository<Listing>>;

  // 쿼리 빌더 모의 객체
  const mockSubQueryBuilder: MockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    getQuery: jest.fn().mockReturnValue('SELECT listing_sub.id FROM ...'), // 서브쿼리 문자열 모의
    getParameters: jest.fn().mockReturnValue({ param1: 'value1' }), // 서브쿼리 파라미터 모의
    innerJoinAndSelect: jest.fn(),
    setParameters: jest.fn(),
    getMany: jest.fn(),
  };

  const mockMainQueryBuilder: MockQueryBuilder = {
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    getMany: jest.fn(), // getMany는 동적으로 모의 값을 설정
    select: jest.fn(),
    innerJoin: jest.fn(),
    groupBy: jest.fn(),
    having: jest.fn(),
    getQuery: jest.fn(),
    getParameters: jest.fn(),
  };

  beforeEach(() => {
    dataSource = {
      createQueryBuilder: jest.fn().mockImplementation(() => {
        return mockSubQueryBuilder;
      }),
    };
    repository = {
      createQueryBuilder: jest.fn().mockImplementation((alias: string) => {
        if (alias === 'listing') {
          return mockMainQueryBuilder;
        }
        throw new Error(
          `Repository.createQueryBuilder에 예기치 않은 별칭이 사용되었습니다: ${alias}`,
        );
      }),
    };
    listingRepository = new ListingRepository(
      repository as Repository<Listing>,
      dataSource as DataSource,
    );

    // 각 테스트 전에 모의 객체 초기화
    jest.clearAllMocks();

    // createQueryBuilder가 별칭에 따라 다른 모의 빌더를 반환하도록 재설정
    (dataSource.createQueryBuilder as jest.Mock).mockReturnValue(
      mockSubQueryBuilder,
    );
    (repository.createQueryBuilder as jest.Mock).mockImplementation(
      (alias: string) => {
        if (alias === 'listing') {
          return mockMainQueryBuilder;
        }
      },
    );
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
      const mockListings: Listing[] = [
        {
          id: 1n,
          name: '테스트 숙소',
          description: '설명',
          guestCapacity: 2,
          infantCapacity: 1,
          address: '주소',
          hostId: 1n,
          host: {
            id: 1n,
            email: 'test@example.com',
            password: 'password',
            name: 'Test Host',
          } as User,
          schedules: [],
        } as Listing,
      ];

      // getMany가 모의 숙소 목록을 반환하도록 설정
      mockMainQueryBuilder.getMany.mockResolvedValue(mockListings);

      const result = await listingRepository.searchListings(searchDto);

      const startDate = new Date(searchDto.fromDate);
      const endDate = new Date(searchDto.toDate);
      const diffDays = 3; // '2024-01-01'부터 '2024-01-03'까지는 3일

      // --- 서브쿼리 호출 검증 ---
      expect(dataSource.createQueryBuilder).toHaveBeenCalledWith(
        'schedule_sub',
        'schedule_sub',
      );
      expect(mockSubQueryBuilder.select).toHaveBeenCalledWith(
        'schedule_sub.listingId',
      );
      expect(mockSubQueryBuilder.where).toHaveBeenCalledWith(
        'schedule_sub.date BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
      expect(mockSubQueryBuilder.andWhere).toHaveBeenCalledWith(
        'schedule_sub.isAvailable = :isAvailable',
        { isAvailable: true },
      );
      expect(mockSubQueryBuilder.andWhere).toHaveBeenCalledWith(
        'schedule_sub.price BETWEEN :minPrice AND :maxPrice',
        {
          minPrice: searchDto.minPrice,
          maxPrice: searchDto.maxPrice,
        },
      );
      expect(mockSubQueryBuilder.groupBy).toHaveBeenCalledWith(
        'listing_sub.id',
      );
      expect(mockSubQueryBuilder.having).toHaveBeenCalledWith(
        'COUNT(DISTINCT schedule_sub.date) = :diffDays',
        { diffDays },
      );

      // --- 메인쿼리 호출 검증 ---
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('listing');
      expect(mockMainQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        'listing.schedules',
        'schedule',
      );
      expect(mockMainQueryBuilder.where).toHaveBeenCalledWith(
        'listing.guestCapacity >= :guestSize',
        { guestSize: searchDto.guestSize },
      );
      expect(mockMainQueryBuilder.andWhere).toHaveBeenCalledWith(
        'listing.infantCapacity >= :infantSize',
        { infantSize: searchDto.infantSize },
      );
      expect(mockMainQueryBuilder.andWhere).toHaveBeenCalledWith(
        'listing.id IN (' + mockSubQueryBuilder.getQuery() + ')',
      );
      expect(mockMainQueryBuilder.andWhere).toHaveBeenCalledWith(
        'schedule.date BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
      expect(mockMainQueryBuilder.andWhere).toHaveBeenCalledWith(
        'schedule.isAvailable = :isAvailable',
        { isAvailable: true },
      );
      expect(mockMainQueryBuilder.andWhere).toHaveBeenCalledWith(
        'schedule.price BETWEEN :minPrice AND :maxPrice',
        {
          minPrice: searchDto.minPrice,
          maxPrice: searchDto.maxPrice,
        },
      );
      expect(mockMainQueryBuilder.setParameters).toHaveBeenCalledWith(
        mockSubQueryBuilder.getParameters(),
      );
      expect(mockMainQueryBuilder.getMany).toHaveBeenCalled();

      // --- 최종 결과 검증 ---
      expect(result).toEqual(mockListings);
    });
  });
});
