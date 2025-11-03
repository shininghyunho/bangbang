import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OauthAccount } from '../../auth/entities/oauth_account.entity';
import { Listing } from '../../listings/entities/listing.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: bigint;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  name: string;

  @OneToMany(() => Listing, (listing) => listing.host)
  listings: Listing[];

  @OneToMany(() => OauthAccount, (oauthAccount) => oauthAccount.user)
  oauthAccounts: OauthAccount[];
}
