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

export async function configHandler(instances: RedisInstances, { pattern }: { pattern: string | null }): Promise<void> {
  console.log(chalk.blue('Configuration in Redis Clients'));
  const { clients, errors } = await connectInstances(instances);

  printErrors(errors);
  await iterateClients(clients, instances, configGetClient.bind(null, pattern));

  endClients(clients);
}

async function configGetClient(pattern: (string | null), instance: RedisInstance, client: RedisClient) {
  if (client.connected) {
    const info = await invokeRedis(client, 'config', 'get', pattern || '*');

    printClient(instance, client);
    printList(info);
  } else {
    printClient(instance, client);
  }
}

function printList(list: string[]) {
  for (let i = 0; i < list.length; i += 2) {
    console.log('  ', chalk.yellow(list[i]), ':', list[i + 1]);
  }
}
