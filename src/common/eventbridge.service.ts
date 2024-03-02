import {
  CreateScheduleCommand,
  SchedulerClient,
  FlexibleTimeWindowMode,
  GetScheduleCommand,
} from '@aws-sdk/client-scheduler';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { awsConfig } from 'src/config';
import { getAfterMonthDate } from './util/date';

export type EventBridgePutRoleParams = {
  StartDate: string | Date;
  EndDate: string | Date;
  Schedule: {
    Hour: number | string;
    Minute: number | string;
  };
  Input?: {
    user: Partial<User> & { name: string };
  };
};

@Injectable()
export class EventBridgeService {
  private scheduler: SchedulerClient;

  constructor(
    @Inject(awsConfig.KEY)
    private config: ConfigType<typeof awsConfig>,

    @Inject(AuthService)
    private authService: AuthService,
  ) {
    this.scheduler = new SchedulerClient({ region: config.aws.s3.region });
  }

  async register(user: User) {
    const setting = await this.authService.getSetting(user.id);
    const [hour, min] = [
      setting.preferred_time.slice(0, 2),
      setting.preferred_time.slice(2),
    ];

    return await this.putRule({
      StartDate: new Date(),
      EndDate: getAfterMonthDate(1),
      Schedule: {
        Hour: hour,
        Minute: min,
      },
      Input: {
        user: user,
      },
    });
  }

  async getRule(userName: string) {
    const command = new GetScheduleCommand({
      Name: `SYSTEM-USER-${userName}-Rules`,
    });

    const response = await this.scheduler.send(command).catch((err) => {
      if (err.$metadata.httpStatusCode === 404) {
        return null;
      }
    });

    return response;
  }

  putRule = async ({
    EndDate,
    StartDate,
    Schedule,
    Input,
  }: EventBridgePutRoleParams) => {
    const command = new CreateScheduleCommand({
      Name: `SYSTEM-USER-${Input.user.name}-Rules`,
      GroupName: 'default',
      ScheduleExpression: `cron(${+Schedule.Minute} ${+Schedule.Hour} * * ? *)`,
      FlexibleTimeWindow: {
        Mode: FlexibleTimeWindowMode.FLEXIBLE,
        MaximumWindowInMinutes: 15,
      },
      ScheduleExpressionTimezone: 'Asia/Seoul',
      Target: {
        Arn: this.config.aws.eventBridge.target.arn,
        RoleArn: this.config.aws.eventBridge.target.roleArn,
        Input: JSON.stringify(Input),
      },

      StartDate: new Date(StartDate),
      EndDate: new Date(EndDate),
    });

    const response = await this.scheduler.send(command).catch((err) => {
      // [TODO]: 409 Error thorw  Custom Exception 만들기
      return err.message;
    });

    return response;
  };
}
