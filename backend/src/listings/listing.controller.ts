import { Controller, Get, Query } from '@nestjs/common';
import { ListingService } from './listing.service';
import { SearchListingsRequestDto } from './dto/search-listings.request.dto';
import { ListingSearchResponseDto } from './dto/listing-search.response.dto';
import { Listing } from './entities/listing.entity';

@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Get('search')
  async searchListings(
    @Query() searchDto: SearchListingsRequestDto,
  ): Promise<ListingSearchResponseDto[]> {
    return this.listingService.searchListings(searchDto);
  }

  @Get('all')
  async all(): Promise<Listing[]> {
    return this.listingService.selectLimit10();
  }
}
