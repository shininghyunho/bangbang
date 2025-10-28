import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ListingModule } from './listings/listing.module';
import { Listing } from './listings/entities/listing.entity';
import { ListingSchedule } from './listings/entities/listing-schedule.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [Listing, ListingSchedule, User],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    ListingModule,
  ],
})
export class AppModule {}
