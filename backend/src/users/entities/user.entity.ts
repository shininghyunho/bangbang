import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Listing } from '../../listings/entities/listings.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Listing, (listing) => listing.host)
  listings: Listing[];

  // 이후 구현을 위한 참고 주석.
  // Relationship with Booking (as user)
  // @OneToMany(() => Booking, (booking) => booking.user)
  // bookings: Booking[];

  // Relationship with Role (via UserRole junction table)
  // @ManyToMany(() => Role)
  // @JoinTable({
  //   name: 'user_roles', // junction table name
  //   joinColumn: { name: 'userId', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  // })
  // roles: Role[];
}