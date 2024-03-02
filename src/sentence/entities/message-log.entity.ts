import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Sentence } from 'src/sentence/entities/sentence.entity';

@Entity()
export class MessageLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.messageLogs)
  user: User;

  @ManyToOne(() => Sentence, (sentence) => sentence.id)
  sentence: Sentence;

  @CreateDateColumn()
  sent_datetime: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
