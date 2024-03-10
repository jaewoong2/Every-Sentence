import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from 'src/sentence/entities/category.entity';
import { IsString } from 'class-validator';
import { getAfterMonthDate } from 'src/common/util/date';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.setting, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.setting, {
    nullable: true,
    lazy: true,
  })
  preferred_category: Promise<Category>;

  @Column({ nullable: true, default: '1100' })
  @IsString()
  preferred_time: string;

  @Column('date', { nullable: true, default: getAfterMonthDate(1) })
  end_time: Date;
}
