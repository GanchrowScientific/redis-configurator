'use strict';

import { RedisClient } from 'redis';

import { RedisClients, RedisInstance, RedisInstances } from './interfaces';

export async function iterateClients(
  clients: RedisClients, instances: RedisInstances,
  cb: (instance: RedisInstance, client: RedisClient) => Promise<void>) {

  // ensure sort matches the config file
  return Promise.all(Object.entries(clients).sort(([l1], [l2]) =>
    instances[l1].index - instances[l2].index)
    .map(async ([label, client]) => await cb(instances[label], client)));
}
