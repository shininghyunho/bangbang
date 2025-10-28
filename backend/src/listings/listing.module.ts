import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './entities/listing.entity';
import { ListingSchedule } from './entities/listing-schedule.entity';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { ListingRepository } from './repositories/listing.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, ListingSchedule])],
  controllers: [ListingController],
  providers: [ListingService, ListingRepository],
})
export class ListingModule {}
