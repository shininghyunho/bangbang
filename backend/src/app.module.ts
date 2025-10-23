import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ListingModule } from './listings/listing.module';
import { Listing } from './listings/entities/listing.entity';
import { ListingSchedule } from './listings/entities/listing-schedule.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'bangbang_db',
      entities: [Listing, ListingSchedule, User],
      synchronize: true,
    }),
    ListingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
