'use strict';

import { default as chalk } from 'chalk';
import { RedisClient } from 'redis';

import { connectInstances } from '../connectInstances';
import { endClients } from '../endClients';
import { RedisInstance, RedisInstances } from '../interfaces';
import { invokeRedis } from '../invokeRedis';
import { iterateClients } from '../iterateClients';
import { printClient } from '../printClient';
import { printErrors } from '../printErrors';

export async function setHandler(instances: RedisInstances,
  { key, value, rewrite }: { key: string, value: string | number, rewrite: boolean }): Promise<void> {

  console.log(chalk.blue('Setting configuration in Redis Clients'));
  const { clients, errors } = await connectInstances(instances);

  printErrors(errors);
  await iterateClients(clients, instances, configSetClient.bind(null, key, value, rewrite));

  endClients(clients);
}

async function configSetClient(key: string, value: string | number, rewrite: boolean,
  instance: RedisInstance, client: RedisClient) {
  if (client.connected) {
    const setResult = await invokeRedis(client, 'config', 'set', key, value);
    if (rewrite) {
      await invokeRedis(client, 'config', 'rewrite');
    }

    printClient(instance, client);
    console.log('  ', chalk.yellow(setResult));
  } else {
    printClient(instance, client);
    console.log('  ', chalk.yellow('NOT CONNECTED'));
  }
}
