import { Controller, Get, Query } from '@nestjs/common';
import { ListingService } from './listing.service';
import { SearchListingsRequestDto } from './dto/search-listings.request.dto';
import { ListingResponseDto } from './dto/listing.response.dto';

@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Get('search')
  async searchListings(@Query() searchDto: SearchListingsRequestDto): Promise<ListingResponseDto[]> {
    return this.listingService.searchListings(searchDto);
  }
}
