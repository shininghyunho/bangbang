import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ListingModule } from './listings/listing.module';
import { Listing } from './listings/entities/listing.entity';
import { ListingSchedule } from './listings/entities/listing-schedule.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    TypeOrmModule.forRoot({
        type: 'mysql',
        driver: require('mysql2'),
        connectorPackage: 'mysql2',
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT) || 3308,
        username: process.env.DATABASE_USER || 'test_user',
        password: process.env.DATABASE_PASSWORD || '1234',
        database: process.env.DATABASE_NAME || 'test_db',
        entities: [Listing, ListingSchedule, User],
      }),
    ListingModule,
  ],
})
export class AppModule {}
