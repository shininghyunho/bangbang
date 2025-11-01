import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Listing } from './listing.entity';

@Entity('listing_schedule')
@Index('idx_search_01', ['date', 'price'])
export class ListingSchedule {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: bigint;

  @Index('fk_schedule_listingId')
  @Column({ type: 'bigint', name: 'listingId' })
  listingId: bigint;

  @Column({ type: 'date', nullable: false })
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'tinyint', width: 1, default: true, nullable: false })
  isAvailable: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Listing, (listing) => listing.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'listingId' })
  listing: Listing;
}
