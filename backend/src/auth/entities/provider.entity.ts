import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
  name!: string;
}
