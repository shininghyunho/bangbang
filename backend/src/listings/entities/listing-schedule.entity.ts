import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Listing } from './listing.entity';

@Entity('listing_schedule')
@Index(['date', 'isAvailable', 'price', 'listingId']) // IDX_search 인덱스 반영
export class ListingSchedule {
  @PrimaryColumn({ type: 'bigint', name: 'listingId' })
  listingId: number;

  @PrimaryColumn({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'boolean', default: true, nullable: false })
  isAvailable: boolean;

  @CreateDateColumn({ type: 'datetime', name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updatedAt' })
  updatedAt: Date;

  @ManyToOne(() => Listing, (listing) => listing.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing: Listing;
}
