import { User } from 'src/auth/entities/user.entity';

export const useEventBridgeSchedulerSchedule = (token: string, user: User) => {
  const headers = {
    Authorization: `${token}`,
  };

  const body = {
    user,
  };

  const template = JSON.parse(
    JSON.stringify(AWS_EVENT_BRIDGE_SCHEDULER_TEMPLATE),
  );

  template.headers.Authorization = headers.Authorization;
  template.body = JSON.stringify(body);

  return {
    getScheduleTemplate: () => template,
  };
};

export const AWS_EVENT_BRIDGE_SCHEDULER_TEMPLATE = {
  resource: '/{proxy+}',
  path: '/api/sentence',
  httpMethod: 'POST',
  headers: {
    Accept: '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
    Host: 'api.prlc.kr',
  },
  multiValueHeaders: {
    Accept: ['*/*'],
    'Accept-Encoding': ['gzip, deflate, br'],
    Authorization: [],
    'Cache-Control': ['no-cache'],
    'Content-Type': ['application/json'],
    Host: ['api.prlc.kr'],
    'X-Forwarded-For': [],
    'X-Forwarded-Port': ['443'],
    'X-Forwarded-Proto': ['https'],
  },
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  pathParameters: {
    proxy: 'api/sentence',
  },
  stageVariables: null,
  requestContext: {
    resourcePath: '/{proxy+}',
    httpMethod: 'POST',
    path: '/api/sentence',
    protocol: 'HTTP/1.1',
    stage: 'dev',
    domainPrefix: 'api',
    identity: {},
    domainName: 'api.prlc.kr',
  },
  isBase64Encoded: false,
};
