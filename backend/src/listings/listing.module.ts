import { Module } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './entities/listing.entity';
import { ListingSchedule } from './entities/listing-schedule.entity';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { ListingRepository } from './repositories/listing.repository';
import { DataSource } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, ListingSchedule])],
  providers: [
    ListingService,
    {
      provide: ListingRepository,
      useFactory: (dataSource: DataSource) => new ListingRepository(dataSource),
      inject: [getDataSourceToken()],
    },
  ],
  controllers: [ListingController],
})
export class ListingModule {}
