import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Provider } from './provider.entity';

@Entity('oauth_accounts')
@Unique('uq_provider_providerUserId', ['providerId', 'providerUserId'])
export class OauthAccount {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: bigint;

  @Column({ type: 'bigint', name: 'user_id', nullable: false })
  userId: bigint;

  @Column({ type: 'int', name: 'provider_id', nullable: false })
  providerId: number;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'provider_user_id',
    nullable: false,
  })
  providerUserId: string;

  @ManyToOne(() => User, (user) => user.oauthAccounts, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Provider, {
    onDelete: 'CASCADE',
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}
