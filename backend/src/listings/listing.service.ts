import { Injectable } from '@nestjs/common';
import { SearchListingsRequestDto } from './dto/search-listings.request.dto';
import { ListingSearchResponseDto } from './dto/listing-search.response.dto';
import { ListingRepository } from './repositories/listing.repository';
import { Listing } from './entities/listing.entity';

@Injectable()
export class ListingService {
  constructor(private readonly listingRepository: ListingRepository) {}

  async searchListings(
    requestDto: SearchListingsRequestDto,
  ): Promise<ListingSearchResponseDto[]> {
    return this.listingRepository.searchListings(requestDto);
  }

  async selectLimit10(): Promise<Listing[]> {
    const listings = this.listingRepository.selectLimit10();
    return listings;
  }
}
