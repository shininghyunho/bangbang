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

import { User } from 'src/users/entities/user.entity';

@Entity('listings')
@Index(['guestCapacity', 'infantCapacity'])
export class Listing {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', nullable: false })
  hostId: number;

  @ManyToOne(() => User, (user) => user.listings)
  @JoinColumn({ name: 'hostId' })
  host: User;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 1, nullable: false })
  guestCapacity: number;

  @Column({ type: 'int', default: 0, nullable: false })
  infantCapacity: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;
}