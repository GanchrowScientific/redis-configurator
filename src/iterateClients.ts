'use strict';

import { default as chalk } from 'chalk';
import { RedisClient } from 'redis';

import { RedisClients, RedisInstance, RedisInstances } from './interfaces';

export async function iterateClients(
  clients: RedisClients, instances: RedisInstances,
  cb: (instance: RedisInstance, client: RedisClient) => Promise<void>) {

  // ensure sort matches the config file
  return Promise.all(Object.entries(clients).sort(([l1], [l2]) =>
    instances[l1].index - instances[l2].index)
    .map(async ([label, client]) => {
      try {
        return await cb(instances[label], client);
      } catch (e) {
        console.error(chalk.red(e.message));
        return e;
      }
    }));
}
