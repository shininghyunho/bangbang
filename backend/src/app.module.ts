import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ListingModule } from './listings/listing.module';
import { Listing } from './listings/entities/listing.entity';
import { ListingSchedule } from './listings/entities/listing-schedule.entity';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { OauthAccount } from './auth/entities/oauth_account.entity';
import { Provider } from './auth/entities/provider.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        driver: require('mysql2'),
        connectorPackage: 'mysql2',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 3308),
        username: configService.get<string>('DATABASE_USER', 'test_user'),
        password: configService.get<string>('DATABASE_PASSWORD', '1234'),
        database: configService.get<string>('DATABASE_NAME', 'test_db'),
        entities: [Listing, ListingSchedule, User, OauthAccount, Provider],
        synchronize:false,
      }),
      inject: [ConfigService],
    }),
    ListingModule,
    AuthModule,
  ],
})
export class AppModule {}
