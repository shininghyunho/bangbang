import { Injectable } from '@nestjs/common';
import { SearchListingsRequestDto } from './dto/search-listings.request.dto';
import { ListingResponseDto } from './dto/listing.response.dto';
import { ListingRepository } from './repositories/listing.repository';

const RESULT_LIMIT_SIZE = 20;
@Injectable()
export class ListingService {
  constructor(
    private readonly listingRepo: ListingRepository,
  ) {}

  async searchListings(requestDto: SearchListingsRequestDto): Promise<ListingResponseDto[]> {
    const listings = await this.listingRepo.searchListings(requestDto);

    const results: ListingResponseDto[] = listings.map(l => {
      // 함수형 문법으로 totalPrice를 구한다.  
      const totalPrice = l.schedules.reduce((acc, s) => acc + Number(s.price), 0);
        return {
          name: l.name,
          description: l.description,
          address: l.address,
          totalPrice: totalPrice,
          guestCapacity: l.guestCapacity,
          infantCapacity: l.infantCapacity,
        };
      }
    );

    // return 값은 오름차순 정렬후, RESULT_LIMIT_SIZE 이하로만 반환한다.
    return results
      .sort((a, b) => a.totalPrice - b.totalPrice)
      .slice(0, RESULT_LIMIT_SIZE);
  }
}
