import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Setting } from '../entities/setting.entity';

export interface UserFindOneOptions {
  id?: number;
  email?: string;
}

export interface UserUpdateOptions extends Partial<User> {
  email: string;
}

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  // userAuth, userProfile 조회를 막고, user를 통해서만 조회 가능하도록 합니다.
  public async findOneBy({ id, email }: UserFindOneOptions = {}) {
    const qb = this.createQueryBuilder('User')
      .leftJoinAndSelect('User.setting', 'userSetting')
      .leftJoinAndSelect('User.messageLogs', 'userMessageLogs');

    if (id) qb.andWhere('User.id = :id', { id });

    if (email) qb.andWhere('User.email = :email', { email });

    return await qb.getOne();
  }

  public async delete(userId: number) {
    return this.delete(userId);
  }

  public async updateUser({ email, setting, ...userData }: UserUpdateOptions) {
    const user = await this.findOneBy({ email });
    const settingRepository = this.manager.getRepository(Setting);

    this.manager.transaction(async () => {
      await this.update({ email }, { ...userData });
      if (setting !== null) {
        await settingRepository.update({ id: user.setting.id }, { ...setting });
      }
    });
  }
}
