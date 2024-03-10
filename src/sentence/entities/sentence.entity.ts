import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Sentence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sentence: string;

  @Column()
  translation: string;

  @Column({ nullable: true })
  ko_pronunciation: string;

  @Column({ nullable: true })
  jp_pronunciation: string;

  @Column({ nullable: true })
  roma_pronunciation: string;

  @Column({ nullable: true })
  example: string;

  @Column({ nullable: true })
  example_ko_pronunciation: string;

  @Column({ nullable: true })
  example_jp_pronunciation: string;

  @Column({ nullable: true })
  example_roma_pronunciation: string;

  @Column({ nullable: true })
  explanation: string;

  @ManyToOne(() => Category, (category) => category.sentences, { lazy: true })
  category: Category;

  @CreateDateColumn()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
