import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { ListingSchedule } from './listing-schedule.entity';

@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: bigint;

  @Index('fk_listings_hostId')
  @Column({ type: 'bigint', nullable: true })
  hostId: bigint;

  @ManyToOne(() => User, (user) => user.listings)
  @JoinColumn({ name: 'hostId' })
  host: User;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 1, nullable: false })
  guestCapacity: number;

  @Column({ type: 'int', default: 0, nullable: false })
  infantCapacity: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  address: string;

  @OneToMany(() => ListingSchedule, (schedule) => schedule.listing)
  schedules: ListingSchedule[];
}