'use strict';

import { RedisClient } from 'redis';
import { promisify } from 'util';

export async function invokeRedis<T>(client: RedisClient, method: string,
  ...args: T[]): Promise<any> {

  return promisify(RedisClient.prototype[method]).apply(client, args);
}
