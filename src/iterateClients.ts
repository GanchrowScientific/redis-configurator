'use strict';

import { RedisClient } from 'redis';

import { RedisClients, RedisInstance, RedisInstances } from './interfaces';

export function iterateClients(clients: RedisClients, instances: RedisInstances,
                               cb: (instance: RedisInstance, client: RedisClient) => void) {

  // ensure sort matches the config file
  Object.entries(clients).sort(([l1], [l2]) =>
    instances[l1].index - instances[l2].index)
  .forEach(([label, client]) => cb(instances[label], client));
}
