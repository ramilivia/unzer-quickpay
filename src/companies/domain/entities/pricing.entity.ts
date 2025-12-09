import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { CostType } from '../enums/cost-type.enum';

@Entity('pricings')
export class Pricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @Column({
    type: 'enum',
    enum: CostType,
    default: CostType.ABSOLUTE,
  })
  costType: CostType;

  @Column({ default: false })
  isBasePlan: boolean;

  @Column()
  companyId: number;

  @ManyToOne(() => Company, (company) => company.pricings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
