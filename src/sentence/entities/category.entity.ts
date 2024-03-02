import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Sentence } from './sentence.entity';
import { Setting } from 'src/auth/entities/setting.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Sentence, (sentence) => sentence.category)
  sentences: Sentence[];

  @OneToMany(() => Setting, (setting) => setting.preferred_category)
  setting: Setting;
}
