import { Injectable } from '@nestjs/common';
import { SearchListingsRequestDto } from './dto/search-listings.request.dto';
import { ListingResponseDto } from './dto/listing.response.dto';
import { ListingRepository } from './repositories/listing.repository';

@Injectable()
export class ListingService {
  constructor(
    private readonly listingsRepository: ListingRepository
  ) {}

  async searchListings(searchDto: SearchListingsRequestDto): Promise<ListingResponseDto[]> {
    const foundListings = await this.listingsRepository.searchListings(searchDto);

    return foundListings.map(listing => {
      const totalPrice = listing.schedules.reduce((sum, schedule) => sum + schedule.price, 0);
      return {
        name: listing.name,
        description: listing.description,
        address: listing.address,
        totalPrice: totalPrice,
        guestCapacity: listing.guestCapacity,
        infantCapacity: listing.infantCapacity,
      };
    });
  }
}
