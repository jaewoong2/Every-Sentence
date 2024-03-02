import { MessageLog } from 'src/sentence/entities/message-log.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Setting } from './setting.entity';
import { IsString } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @IsString()
  phone_number: string;

  @Column({ nullable: true })
  @IsString()
  name: string;

  @Column({ unique: true })
  @IsString()
  email: string;

  @Column({ nullable: true })
  @IsString()
  level: string; // 사용자 등급을 나타내는 필드

  @Column({ nullable: true })
  @IsString()
  refresh_token: string;

  @Column({ nullable: true })
  @IsString()
  access_token: string;

  @OneToMany(() => MessageLog, (messageLog) => messageLog.user)
  messageLogs: MessageLog[];

  @OneToOne(() => Setting, (setting) => setting.user)
  setting: Setting;
}
